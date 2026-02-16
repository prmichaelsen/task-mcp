/**
 * Firestore Collection Path Helpers
 *
 * Helper functions to generate consistent Firestore collection paths
 * for user-scoped data access.
 */
/**
 * Get the tasks collection path for a specific user
 *
 * @param userId - The user's ID
 * @returns Firestore collection path: users/{userId}/tasks
 *
 * @example
 * const tasksPath = getUserTasks('user123')
 * // Returns: 'users/user123/tasks'
 */
export declare function getUserTasks(userId: string): string;
/**
 * Get a specific task document path for a user
 *
 * @param userId - The user's ID
 * @param taskId - The task's ID
 * @returns Firestore document path: users/{userId}/tasks/{taskId}
 *
 * @example
 * const taskPath = getUserTask('user123', 'task456')
 * // Returns: 'users/user123/tasks/task456'
 */
export declare function getUserTask(userId: string, taskId: string): string;
/**
 * Get the messages subcollection path for a specific task
 *
 * @param userId - The user's ID
 * @param taskId - The task's ID
 * @returns Firestore collection path: users/{userId}/tasks/{taskId}/messages
 *
 * @example
 * const messagesPath = getUserTaskMessages('user123', 'task456')
 * // Returns: 'users/user123/tasks/task456/messages'
 */
export declare function getUserTaskMessages(userId: string, taskId: string): string;
/**
 * Get a specific task message document path
 *
 * @param userId - The user's ID
 * @param taskId - The task's ID
 * @param messageId - The message's ID
 * @returns Firestore document path: users/{userId}/tasks/{taskId}/messages/{messageId}
 *
 * @example
 * const messagePath = getUserTaskMessage('user123', 'task456', 'msg789')
 * // Returns: 'users/user123/tasks/task456/messages/msg789'
 */
export declare function getUserTaskMessage(userId: string, taskId: string, messageId: string): string;
/**
 * Get the task events collection path for a specific user
 *
 * @param userId - The user's ID
 * @returns Firestore collection path: users/{userId}/task_events
 *
 * @example
 * const eventsPath = getUserTaskEvents('user123')
 * // Returns: 'users/user123/task_events'
 */
export declare function getUserTaskEvents(userId: string): string;
/**
 * Get a specific task event document path
 *
 * @param userId - The user's ID
 * @param eventId - The event's ID
 * @returns Firestore document path: users/{userId}/task_events/{eventId}
 *
 * @example
 * const eventPath = getUserTaskEvent('user123', 'event789')
 * // Returns: 'users/user123/task_events/event789'
 */
export declare function getUserTaskEvent(userId: string, eventId: string): string;
//# sourceMappingURL=collections.d.ts.map