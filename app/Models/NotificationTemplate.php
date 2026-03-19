<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'name',
        'subject',
        'body',
        'whatsapp_template',
        'push_title',
        'push_body',
        'variables',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'variables' => 'array',
            'is_active' => 'boolean',
        ];
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Helpers
    public function render(string $template, array $variables): string
    {
        $rendered = $template;
        
        foreach ($variables as $key => $value) {
            $rendered = str_replace('{{' . $key . '}}', $value, $rendered);
            $rendered = str_replace('{{ ' . $key . ' }}', $value, $rendered);
        }
        
        return $rendered;
    }

    public function renderEmail(array $variables): array
    {
        return [
            'subject' => $this->render($this->subject ?? '', $variables),
            'body' => $this->render($this->body, $variables),
        ];
    }

    public function renderWhatsApp(array $variables): string
    {
        return $this->render($this->whatsapp_template ?? $this->body, $variables);
    }

    public function renderPush(array $variables): array
    {
        return [
            'title' => $this->render($this->push_title ?? $this->name, $variables),
            'body' => $this->render($this->push_body ?? $this->body, $variables),
        ];
    }
}
