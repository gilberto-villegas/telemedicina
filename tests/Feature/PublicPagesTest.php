<?php

namespace Tests\Feature;

use Tests\TestCase;

class PublicPagesTest extends TestCase
{
    public function test_home_page_returns_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertViewIs('app');
    }

    public function test_privacy_page_returns_successful_response(): void
    {
        $response = $this->get('/privacy');

        $response->assertStatus(200);
        $response->assertViewIs('app');
    }

    public function test_terms_page_returns_successful_response(): void
    {
        $response = $this->get('/terms');

        $response->assertStatus(200);
        $response->assertViewIs('app');
    }

    public function test_contact_page_returns_successful_response(): void
    {
        $response = $this->get('/contact');

        $response->assertStatus(200);
        $response->assertViewIs('app');
    }
}
