package me.aleksi.wordless

import java.time.Instant
import java.time.temporal.ChronoUnit

class ContentSeeder(private val postDao: PostDao, private val commentDao: CommentDao, private val tagDao: TagDao) : Seeder {
    override fun seed() {
        val tagHello = tagDao.insert(Tag(name = "hello-world"))
        val tagLorem = tagDao.insert(Tag(name = "lorem-ipsum"))
        tagDao.insert(Tag(name = "unused"))

        run {
            val title = "hello world"
            val createdPost = Post(id = 0,
                                   title = title,
                                   slug = title.slugify(),
                                   public = true,
                                   locked = false,
                                   postedTime = Instant.now().minus(1, ChronoUnit.HOURS),
                                   editedTime = null,
                                   summary = "world",
                                   content = "hello world")
            val id = postDao.insert(createdPost)

            tagDao.addTagToPost(id, tagHello)
            tagDao.addTagToPost(id, tagLorem)

            commentDao.insert(
                Comment(id = 0,
                        postId = id,
                        author = "aleksi",
                        postedTime = Instant.now(),
                        content = "spam"))
            commentDao.insert(
                Comment(id = 0,
                        postId = id,
                        author = "iskela",
                        postedTime = Instant.now().minus(30, ChronoUnit.MINUTES),
                        content = "maps"))
        }

        run {
            val title = "lorem ipsum"
            val createdPost = Post(id = 0,
                                   title = title,
                                   slug = title.slugify(),
                                   public = true,
                                   locked = false,
                                   postedTime = Instant.now(),
                                   editedTime = null,
                                   summary = "dolor sit amet",
                                   content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")
            val id = postDao.insert(createdPost)

            tagDao.addTagToPost(id, tagLorem)

            commentDao.insert(
                Comment(id = 0,
                        postId = id,
                        author = "aleksi",
                        postedTime = Instant.now(),
                        content = "hello!"))
        }

        run {
            val title = "test post"
            val createdPost = Post(id = 0,
                                   title = title,
                                   slug = title.slugify(),
                                   public = true,
                                   locked = true,
                                   postedTime = Instant.now(),
                                   editedTime = null,
                                   summary = "test summary",
                                   content = "test content")
            postDao.insert(createdPost)
        }
    }
}
