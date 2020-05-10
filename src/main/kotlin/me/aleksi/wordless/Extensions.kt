package me.aleksi.wordless

import java.text.Normalizer

/**
 * Turns a string into slug-form: all lowercase, whitespace replaced with dashes and limits its length to 100 characters.
 *
 * Source: https://stackoverflow.com/a/58422689
 */
fun String.slugify(): String = Normalizer
    .normalize(this, Normalizer.Form.NFD)
    .replace("[^\\w\\s-]".toRegex(), "") // Remove all non-word, non-space or non-dash characters
    .replace('-', ' ') // Replace dashes with spaces
    .trim() // Trim leading/trailing whitespace (including what used to be leading/trailing dashes)
    .replace("\\s+".toRegex(), "-") // Replace whitespace (including newlines and repetitions) with single dashes
    .take(100)
    .toLowerCase() // Lowercase the final results
