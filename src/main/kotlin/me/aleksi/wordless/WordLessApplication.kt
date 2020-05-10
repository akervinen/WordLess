package me.aleksi.wordless

import org.jdbi.v3.core.Jdbi
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.core.io.ClassPathResource
import org.springframework.core.io.Resource
import org.springframework.util.FileCopyUtils
import java.io.InputStreamReader
import kotlin.text.Charsets.UTF_8

/**
 * Blog application.
 */
@SpringBootApplication
class WordLessApplication constructor(private val jdbi: Jdbi, private val seeder: Seeder) : CommandLineRunner {
    /**
     * Runs on startup, prints information and creates database schema and initial data.
     */
    override fun run(vararg args: String?) {
        println("Team: Spaghetti Forever")
        println("\tMember: Aleksi Kervinen")
        println()

        val curlSample = getStringFromResource(ClassPathResource("/curl-samples.txt"))
        println("curl samples:")
        println(curlSample)

        println("Username: admin")
        println("Password: admin")

        val createScript = getStringFromResource(ClassPathResource("/db/create.sql"))

        jdbi.useHandle<Exception> { handle ->
            handle.createScript(createScript).execute()
        }

        seeder.seed()
    }

    /**
     * Gets a file's contents from classpath resources.
     */
    private fun getStringFromResource(resource: Resource): String? {
        return InputStreamReader(resource.inputStream, UTF_8).use { reader ->
            FileCopyUtils.copyToString(reader)
        }
    }
}

/**
 * Starts [WordLessApplication].
 */
fun main(args: Array<String>) {
    runApplication<WordLessApplication>(*args)
}
