package me.aleksi.wordless

/**
 * Simple interface for initial database seeding.
 */
interface Seeder {
    /**
     * Called when app is run. Creates initial data.
     */
    fun seed()
}
