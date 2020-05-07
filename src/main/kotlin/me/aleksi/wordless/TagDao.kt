package me.aleksi.wordless

import org.jdbi.v3.sqlobject.customizer.Bind
import org.jdbi.v3.sqlobject.customizer.BindBean
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate

interface TagDao {
    @SqlQuery("""
        select t.* from "tag" t
        order by t."name"
    """)
    fun getAll(): List<Tag>

    @SqlQuery("""
        select t.* from "post_tags" pt
        inner join "tag" t on pt."tag_id" = t."id"
        group by t."id", t."name"
        order by t."name"
    """)
    fun getAllUsed(): List<Tag>

    @SqlQuery("""
        select t.* from "post_tags" pt
        inner join "tag" t on pt."tag_id" = t."id"
        where "post_id" = :postId
        order by t."name"
    """)
    fun getTagsByPost(@Bind postId: Long): List<Tag>

    @SqlUpdate("""
        insert into "post_tags" ("post_id", "tag_id")
        values (:postId, :tagId)
    """)
    fun addTagToPost(@Bind postId: Long, @Bind tagId: Long)

    @SqlUpdate("""
        insert into "tag" ("name")
        values (:name)
    """)
    @GetGeneratedKeys
    fun insert(@BindBean tag: Tag): Long
}
