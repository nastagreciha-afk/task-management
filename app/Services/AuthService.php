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
                'password' => $data['password'],
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
            $email = $credentials['email'] ?? null;

            Log::info('Login attempt', ['email' => $email]);

            if (! $email) {
                Log::warning('Login attempt with empty email');
                return [
                    'success' => false,
                    'message' => 'Email is required',
                ];
            }

            $user = User::where('email', $email)->first();

            if (! $user) {
                Log::warning('Login attempt failed - user not found', ['email' => $email]);
                return [
                    'success' => false,
                    'message' => 'Invalid credentials',
                ];
            }

            $passwordProvided = $credentials['password'] ?? null;
            if (! $passwordProvided) {
                Log::warning('Login attempt failed - no password provided', ['email' => $email]);
                return [
                    'success' => false,
                    'message' => 'Password is required',
                ];
            }

            if (! Hash::check($passwordProvided, $user->password)) {
                Log::warning('Login attempt failed - invalid password', ['email' => $email, 'user_id' => $user->id]);
                return [
                    'success' => false,
                    'message' => 'Invalid credentials',
                ];
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            Log::info('User logged in successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'has_token' => ! empty($token),
            ]);

            return [
                'success' => true,
                'token' => $token,
                'user' => $user->makeHidden(['password', 'remember_token']),
            ];
        } catch (\Exception $e) {
            Log::error('Login exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
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
