# Bloggit

This is a full-stack MERN application that allows users to view and leave comments on published blog posts on [Bloggit View](https://sheacronin.github.io/blog-viewing) and author and manage their own blog posts on [Bloggit Author](https://sheacronin.github.io/blog-authoring).

The user must make an account through the signup page to author blog posts or leave comments.

### Links

**Repositories:** [API](https://github.com/sheacronin/blog-api) • [Viewing](https://github.com/sheacronin/blog-viewing) • [Authoring](https://github.com/sheacronin/blog-authoring)

**Live Sites:** [Viewing](https://sheacronin.github.io/blog-viewing) • [Authoring](https://sheacronin.github.io/blog-authoring)

## Bloggit View

<img width="1280" alt="Bloggit-View" src="https://user-images.githubusercontent.com/67711077/163388396-8c8ded14-83ad-4ceb-bf04-779aedb45b50.png">

The index page will load all published blog posts for the user to view. The user can also view all comments left on each blog post, with an expandable comments section. Login and sign up pages are available to create an account or log in as an existing user. If the user is logged in, they can leave a comment on any published blog post.

## Bloggit Author

<img width="1280" alt="Bloggit-Author" src="https://user-images.githubusercontent.com/67711077/163388417-81bbca83-78b0-455a-b24a-14d05d8bae27.png">

The index page will load all posts by the signed in user, with buttons to edit, delete, or publish/unpublish each post. There is also an option to view the comments on any post and delete any comment that has been left on your post.

## Bloggit API

The API hosted at [blog-api-sc.herokuapp.com](https://blog-api-sc.herokuapp.com/) has routes to create, read, update, and delete posts, comments, and users.
