insert into "post" ("title", "slug", "public", "posted_time", "edited_time", "summary", "content")
values ('hello world', 'hello-world', true, NOW(), null, 'this is the summary', 'this is the content'),
       ('lorem ipsum', 'lorem-ipsum', false, NOW(), null, 'dolor sit amet',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.')
