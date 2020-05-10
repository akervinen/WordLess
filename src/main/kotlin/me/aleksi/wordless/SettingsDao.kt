package me.aleksi.wordless

import org.jdbi.v3.sqlobject.customizer.Bind
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate
import org.jdbi.v3.sqlobject.transaction.Transaction

/**
 * JDBI data access object for key-value settings.
 */
interface SettingsDao {
    /**
     * Get a value by its [key].
     */
    @SqlQuery("""select s."value" from "settings" s where s."key" = :key""")
    fun get(@Bind key: String): String?

    /**
     * Add a new setting value with given [key] and [value].
     */
    @SqlUpdate("""insert into "settings" ("key", "value") values ( :key, :value )""")
    fun insert(@Bind key: String, @Bind value: String?)

    /**
     * Update an existing setting with given [key] to [value].
     */
    @SqlUpdate("""update "settings" set "value" = :value where "key" = :key""")
    fun update(@Bind key: String, @Bind value: String?)

    /**
     * Set a [key] to [value]. Creates [key] if it doesn't already exist.
     */
    @Transaction
    fun set(key: String, value: String?) {
        if (get(key) != null)
            update(key, value)
        else
            insert(key, value)
    }

    /**
     * Delete [key] from database.
     */
    @SqlUpdate("""delete from "settings" where "key" = :key""")
    fun delete(key: String)
}
