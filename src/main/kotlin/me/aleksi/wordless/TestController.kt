package me.aleksi.wordless

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.ResponseBody

@Controller
class TestController {
    @GetMapping("/api/test")
    @ResponseBody
    fun test() = "hello"
}
