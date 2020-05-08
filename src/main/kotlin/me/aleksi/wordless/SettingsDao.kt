package me.aleksi.wordless

import org.jdbi.v3.sqlobject.customizer.Bind
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate
import org.jdbi.v3.sqlobject.transaction.Transaction

interface SettingsDao {
    @SqlQuery("""select s."value" from "settings" s where s."key" = :key""")
    fun get(@Bind key: String): String?

    @SqlUpdate("""insert into "settings" ("key", "value") values ( :key, :value )""")
    fun insert(@Bind key: String, @Bind value: String?)

    @SqlUpdate("""update "settings" set "value" = :value where "key" = :key""")
    fun update(@Bind key: String, @Bind value: String?)

    @Transaction
    fun set(key: String, value: String?) {
        if (get(key) != null)
            update(key, value)
        else
            insert(key, value)
    }

    @SqlUpdate("""delete from "settings" where "key" = :key""")
    fun delete(key: String)
}
