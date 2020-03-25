package me.aleksi.wordless

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class WordLessApplication

fun main(args: Array<String>) {
    runApplication<WordLessApplication>(*args)
}
