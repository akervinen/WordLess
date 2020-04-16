-- noinspection SqlResolveForFile @ object-type/"serial"

drop table if exists "comment";
drop table if exists "post";

create table if not exists "post"
(
    id          serial,
    title       varchar(200) not null,
    slug        varchar(100) not null,
    public      boolean      not null,
    posted_time timestamp    not null,
    edited_time timestamp,
    summary     text         not null,
    content     text         not null,
    primary key (id)
);

create index post_posted_time on "post" (posted_time);

create table if not exists "comment"
(
    id          serial,
    post_id     serial,
    author      varchar(100) not null,
    posted_time timestamp    not null,
    content     text         not null,
    primary key (id),
    foreign key (post_id) references "post" (id) on delete cascade
);

create index comment_post_id on "comment" (post_id);
create index comment_posted_time on "comment" (posted_time);
