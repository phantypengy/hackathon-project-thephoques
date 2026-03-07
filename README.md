# hackathon-project

## Sealio

Team members: Dominik, Sarah, Finnán

## Theme chosen: Old but Gold

Web server 3: Audio/Video streaming server

We're making a video site similar to YouTube, with planned features being:



# Features

## Accounts

You can create an account using a username and password.

- Usernames must be unique
- Passwords must be at least 6 characters
- You need an account to post comments and upload videos

## Uploading

If you have an account, you can upload videos.
You may set the title, description and thumbnail.

Supported video file types are .mp4, .webm and .ogg
Supported thumbnail file type are .png, .jpeg, .webp and .gif

## Comments

Users may comment under uploaded videos

## Search

You can search through uploaded videos via the search bar at the top.



# Planned features

## Account page

A separate page for every user where all of the user's videos are listed



# Tech Stack

## Frontend

### HTML, CSS & JavaScript

Used to build and style the user interface and handle all client-side interaction with the backend

## Backend

### Node.js

Runtime for server code - runs JS outside of the browser

### Express

A lightweight web framework for Node.js that handles requests and routes them to the correct code

### express-session

Handles user sessions using a cookie

### Multer

Node.js middleware for handling file uploads - takes user files and stores them on the server's filesystem

### bcrypt

A library for secure password hashing

### cors

A Node.js middleware that manages what is allowed to make requests to the server

## Database

### PostgreSQL

A relational database system that stores all data in tables - handles accounts, video metadata and comments

### node-postgres (pg)

Allows Node.js to talk to PostgreSQL
