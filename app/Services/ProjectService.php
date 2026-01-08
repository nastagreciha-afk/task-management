<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class ProjectService
{
    /**
     * Create a new project.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(User $user, array $data): Project
    {
        try {
            $project = Project::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'user_id' => $user->id,
            ]);

            Log::info('Project created successfully', [
                'project_id' => $project->id,
                'user_id' => $user->id,
            ]);

            return $project->load('user');
        } catch (\Exception $e) {
            Log::error('Project creation failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            throw $e;
        }
    }

    /**
     * Update a project.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Project $project, array $data): Project
    {
        try {
            $project->update($data);

            Log::info('Project updated successfully', [
                'project_id' => $project->id,
            ]);

            return $project->load('user');
        } catch (\Exception $e) {
            Log::error('Project update failed', [
                'error' => $e->getMessage(),
                'project_id' => $project->id,
            ]);

            throw $e;
        }
    }

    /**
     * Delete a project.
     */
    public function delete(Project $project): bool
    {
        try {
            $projectId = $project->id;
            $project->delete();

            Log::info('Project deleted successfully', [
                'project_id' => $projectId,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Project deletion failed', [
                'error' => $e->getMessage(),
                'project_id' => $project->id,
            ]);

            throw $e;
        }
    }

    /**
     * Get projects with search functionality.
     *
     * @param  array<string, mixed>  $filters
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function search(User $user, array $filters = [])
    {
        $query = Project::where('user_id', $user->id)
            ->with('user');

        if (isset($filters['search']) && ! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 15);
    }
}
