package me.aleksi.wordless

import java.time.Instant
import java.time.temporal.ChronoUnit

class ContentSeeder(private val postDao: PostDao, private val commentDao: CommentDao) : Seeder {
    override fun seed() {
        run {
            val title = "hello world"
            val createdPost = Post(0,
                    title,
                    title.slugify(),
                    true,
                    Instant.now().minus(1, ChronoUnit.HOURS),
                    null,
                    "world",
                    "hello world")
            val id = postDao.insert(createdPost)

            commentDao.insert(Comment(
                    0,
                    id,
                    "aleksi",
                    Instant.now(),
                    "spam"
            ))
            commentDao.insert(Comment(
                    0,
                    id,
                    "iskela",
                    Instant.now().minus(30, ChronoUnit.MINUTES),
                    "maps"
            ))
        }

        run {
            val title = "lorem ipsum"
            val createdPost = Post(0,
                    title,
                    title.slugify(),
                    true,
                    Instant.now(),
                    null,
                    "dolor sit amet",
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")
            val id = postDao.insert(createdPost)

            commentDao.insert(Comment(
                    0,
                    id,
                    "aleksi",
                    Instant.now(),
                    "hello!"
            ))
        }
    }
}
