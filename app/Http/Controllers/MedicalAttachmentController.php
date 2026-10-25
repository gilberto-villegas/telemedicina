<?php

namespace App\Http\Controllers;

use App\Models\MedicalAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Gate;

class MedicalAttachmentController extends Controller
{
    /**
     * Securely download a medical attachment.
     */
    public function download(Request $request, string $id)
    {
        $attachment = MedicalAttachment::with('record.appointment')->findOrFail($id);

        Gate::authorize('download', $attachment);

        if (!Storage::disk('private')->exists($attachment->storage_path)) {
            return response()->json(['message' => 'Archivo no encontrado'], 404);
        }

        return Storage::disk('private')->download($attachment->storage_path, $attachment->file_name);
    }
}
