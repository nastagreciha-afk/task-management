<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class TaskService
{
    /**
     * Create a new task.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(User $user, array $data): Task
    {
        try {
            $task = Task::create([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'status' => $data['status'] ?? 'pending',
                'project_id' => $data['project_id'],
                'created_by' => $user->id,
            ]);

            // Attach users if provided
            if (isset($data['user_ids']) && is_array($data['user_ids'])) {
                $task->users()->attach($data['user_ids']);
            }

            Log::info('Task created successfully', [
                'task_id' => $task->id,
                'user_id' => $user->id,
            ]);

            return $task->load(['project', 'creator', 'users']);
        } catch (\Exception $e) {
            Log::error('Task creation failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            throw $e;
        }
    }

    /**
     * Update a task.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Task $task, array $data): Task
    {
        try {
            $task->update([
                'title' => $data['title'] ?? $task->title,
                'description' => $data['description'] ?? $task->description,
                'status' => $data['status'] ?? $task->status,
                'project_id' => $data['project_id'] ?? $task->project_id,
            ]);

            // Sync users if provided
            if (isset($data['user_ids']) && is_array($data['user_ids'])) {
                $task->users()->sync($data['user_ids']);
            }

            Log::info('Task updated successfully', [
                'task_id' => $task->id,
            ]);

            return $task->load(['project', 'creator', 'users']);
        } catch (\Exception $e) {
            Log::error('Task update failed', [
                'error' => $e->getMessage(),
                'task_id' => $task->id,
            ]);

            throw $e;
        }
    }

    /**
     * Delete a task.
     */
    public function delete(Task $task): bool
    {
        try {
            $taskId = $task->id;
            $task->delete();

            Log::info('Task deleted successfully', [
                'task_id' => $taskId,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Task deletion failed', [
                'error' => $e->getMessage(),
                'task_id' => $task->id,
            ]);

            throw $e;
        }
    }

    /**
     * Get tasks with search functionality.
     *
     * @param  array<string, mixed>  $filters
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function search(User $user, array $filters = [])
    {
        $query = Task::with(['project', 'creator', 'users'])
            ->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                    ->orWhereHas('users', function ($q) use ($user) {
                        $q->where('users.id', $user->id);
                    });
            });

        if (isset($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search']) && ! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 15);
    }
}
