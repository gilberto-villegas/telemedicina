<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Appointment;
use App\Models\WithdrawalRequest;
use App\Models\Status;
use App\Services\BcvService;
use Carbon\Carbon;

class WalletController extends Controller
{
    protected $bcvService;

    public function __construct(BcvService $bcvService)
    {
        $this->bcvService = $bcvService;
    }

    // Doctor: Ver balance
    public function balance(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isDoctor()) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $completedStatusId = Status::where('name', 'completed')->first()->id;

        $appointments = Appointment::with('patient')
            ->where('doctor_id', $user->id)
            ->where('status_id', $completedStatusId)
            ->where('doctor_payment_status', 'pending')
            ->get();

        $balanceUsd = $appointments->sum('doctor_earnings_usd');
        $balanceVes = $appointments->sum('doctor_earnings_ves');
        $totalFeeUsd = $appointments->sum('platform_fee_amount_usd');
        $feePercent = \App\Models\Setting::where('key', 'platform_fee_percent')->first()?->value ?? 10;

        return response()->json([
            'balance_usd' => $balanceUsd,
            'balance_ves' => $balanceVes,
            'total_fee_usd' => $totalFeeUsd,
            'platform_fee_percent' => $feePercent,
            'appointments' => $appointments
        ]);
    }

    // Doctor: Solicitar retiro
    public function requestWithdrawal(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isDoctor()) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $completedStatusId = Status::where('name', 'completed')->first()->id;

        $query = Appointment::where('doctor_id', $user->id)
            ->where('status_id', $completedStatusId)
            ->where('doctor_payment_status', 'pending');

        if ($request->has('appointment_ids') && is_array($request->appointment_ids)) {
            $query->whereIn('id', $request->appointment_ids);
        }

        $appointments = $query->get();

        if ($appointments->isEmpty()) {
            return response()->json(['message' => 'No hay saldo disponible para retirar'], 400);
        }

        $exchangeRate = $this->bcvService->getExchangeRate();
        $totalAmountUsd = $appointments->sum('price_usd');
        $totalFeeUsd = $appointments->sum('platform_fee_amount_usd');
        $netAmountUsd = $appointments->sum('doctor_earnings_usd');
        // Actualizar monto VES a la tasa del BCV en el momento de la solicitud
        $netAmountVes = $netAmountUsd * $exchangeRate;

        $withdrawalParams = [
            'doctor_id' => $user->id,
            'total_amount_usd' => $totalAmountUsd,
            'total_fee_usd' => $totalFeeUsd,
            'net_amount_usd' => $netAmountUsd,
            'net_amount_ves' => $netAmountVes,
            'exchange_rate' => $exchangeRate,
            'status' => 'pending'
        ];

        $withdrawal = WithdrawalRequest::create($withdrawalParams);

        Appointment::whereIn('id', $appointments->pluck('id'))->update([
            'doctor_payment_status' => 'requested',
            'withdrawal_request_id' => $withdrawal->id
        ]);

        return response()->json([
            'message' => 'Solicitud de retiro creada exitosamente',
            'withdrawal_request' => $withdrawal
        ], 201);
    }
    
    // Doctor: Ver historial
    public function history(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isDoctor()) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $requests = WithdrawalRequest::with('appointments.patient')
            ->where('doctor_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($requests);
    }

    // Admin: Listar solicitudes
    public function getAdminRequests(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isClinicAdmin()) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $requests = WithdrawalRequest::with(['doctor.bank', 'appointments'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($requests);
    }

    // Admin: Aprobar solicitud
    public function approveRequest(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isClinicAdmin()) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $validated = $request->validate([
            'receipt_image_url' => 'nullable|string',
            'admin_notes' => 'nullable|string'
        ]);

        $withdrawal = WithdrawalRequest::findOrFail($id);
        
        if ($withdrawal->status !== 'pending') {
            return response()->json(['message' => 'La solicitud no está pendiente'], 400);
        }

        $withdrawal->update([
            'status' => 'completed',
            'receipt_image_url' => $validated['receipt_image_url'] ?? null,
            'admin_notes' => $validated['admin_notes'] ?? null,
            'paid_at' => now()
        ]);

        Appointment::where('withdrawal_request_id', $id)->update([
            'doctor_payment_status' => 'paid'
        ]);

        return response()->json([
            'message' => 'Solicitud aprobada exitosamente',
            'withdrawal_request' => $withdrawal
        ]);
    }
}
