<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthService
{
    /**
     * Register a new user.
     *
     * @param  array<string, mixed>  $data
     */
    public function register(array $data): User
    {
        try {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            Log::info('User registered successfully', ['user_id' => $user->id]);

            return $user;
        } catch (\Exception $e) {
            Log::error('User registration failed', [
                'error' => $e->getMessage(),
                'email' => $data['email'] ?? null,
            ]);

            throw $e;
        }
    }

    /**
     * Authenticate a user and return token.
     *
     * @param  array<string, mixed>  $credentials
     * @return array<string, mixed>
     */
    public function login(array $credentials): array
    {
        try {
            $user = User::where('email', $credentials['email'])->first();

            if (! $user || ! Hash::check($credentials['password'], $user->password)) {
                Log::warning('Login attempt failed', ['email' => $credentials['email']]);

                return [
                    'success' => false,
                    'message' => 'Invalid credentials',
                ];
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            Log::info('User logged in successfully', ['user_id' => $user->id]);

            return [
                'success' => true,
                'token' => $token,
                'user' => $user,
            ];
        } catch (\Exception $e) {
            Log::error('Login failed', [
                'error' => $e->getMessage(),
                'email' => $credentials['email'] ?? null,
            ]);

            throw $e;
        }
    }

    /**
     * Logout a user.
     */
    public function logout(User $user): void
    {
        try {
            $user->currentAccessToken()->delete();

            Log::info('User logged out successfully', ['user_id' => $user->id]);
        } catch (\Exception $e) {
            Log::error('Logout failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            throw $e;
        }
    }
}
