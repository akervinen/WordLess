package me.aleksi.wordless

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController
import java.util.*

@RestController
class BlogController(private val postDao: PostDao) {
    @GetMapping("/api/posts")
    fun getAllPosts(): List<Post> {
        return postDao.getAllPosts()
    }

    @GetMapping("/api/posts/{id}")
    fun getPost(@PathVariable id: Long): ResponseEntity<Post> {
        return ResponseEntity.of(Optional.ofNullable(postDao.findById(id)))
    }

    @DeleteMapping("/api/posts/{id}")
    fun deletePost(@PathVariable id: Long): ResponseEntity<Unit> {
        postDao.deleteById(id)
        return ResponseEntity.noContent().build()
    }
}
