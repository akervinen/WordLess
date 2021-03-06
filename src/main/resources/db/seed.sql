insert into "post" ("title", "slug", "public", "posted_time", "edited_time", "summary", "content")
values ('hello world', 'hello-world', true, DATEADD('hour', -1, NOW()), null, 'this is the summary',
        'this is the content'),
       ('lorem ipsum', 'lorem-ipsum', false, NOW(), null, 'dolor sit amet',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'),
       ('test post', 'test-post', true, DATEADD('hour', -2, NOW()), null, 'test summary',
        'test post');

insert into "comment" ("post_id", "author", "posted_time", "content")
values (2, 'aleksi', NOW(), 'hello, world!'),
       (1, 'aleksi', DATEADD('hour', -0.5, NOW()), 'maps'),
       (1, 'iskela', DATEADD('hour', -1, NOW()), 'spam');

insert into "tag" ("name")
values ('hello-world'),
       ('lorem-ipsum'),
       ('unused');

insert into "post_tags" ("post_id", "tag_id")
values (1, 1),
       (1, 2),
       (2, 2);
