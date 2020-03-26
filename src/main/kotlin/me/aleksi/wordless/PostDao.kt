package me.aleksi.wordless

import org.jdbi.v3.sqlobject.customizer.Bind
import org.jdbi.v3.sqlobject.statement.SqlQuery

interface PostDao {
    @SqlQuery("""select * from "post"""")
    fun getAllPosts(): List<Post>

    @SqlQuery("""select * from "post" where "id"=(:id)""")
    fun findById(@Bind("id") id: Long): Post?
}
