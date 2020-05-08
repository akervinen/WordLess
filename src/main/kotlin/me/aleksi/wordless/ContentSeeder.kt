package me.aleksi.wordless

import io.jsonwebtoken.SignatureAlgorithm
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Component
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.*

@Component
class ContentSeeder(private val settingsDao: SettingsDao, private val postDao: PostDao,
                    private val commentDao: CommentDao, private val tagDao: TagDao) : Seeder {
    override fun seed() {
        settingsDao.get("jwt_secret") ?: run {
            val key = Keys.secretKeyFor(SignatureAlgorithm.HS512)
            settingsDao.insert("jwt_secret", Base64.getEncoder().encodeToString(key.encoded))
        }

        val tagHello = tagDao.insert(Tag(name = "hello-world"))
        val tagLorem = tagDao.insert(Tag(name = "lorem-ipsum"))
        tagDao.insert(Tag(name = "unused"))
        val tagCute = tagDao.insert(Tag(name = "cute-animals"))

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
                        content = "## spam"))
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
                                   content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n## Ut enim ad\n\nminim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")
            val id = postDao.insert(createdPost)

            tagDao.addTagToPost(id, tagLorem)

            commentDao.insert(
                Comment(id = 0,
                        postId = id,
                        author = "aleksi",
                        postedTime = Instant.now(),
                        content = "# hello!"))
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

        run {
            val title = "Look at this kitten!"
            val createdPost = Post(id = 0,
                                   title = title,
                                   slug = title.slugify(),
                                   public = true,
                                   locked = true,
                                   postedTime = Instant.now(),
                                   editedTime = null,
                                   summary = "## It's _so_ cute!",
                                   content = "![alt text](https://placekitten.com/600/400 \"title text\")")
            val id = postDao.insert(createdPost)

            tagDao.addTagToPost(id, tagCute)

            commentDao.insert(
                Comment(id = 0,
                        postId = id,
                        author = "me",
                        postedTime = Instant.now(),
                        content = "# you're righT!\n\n![](https://placekitten.com/200/200)"))
        }
    }
}
