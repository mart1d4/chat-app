# Chat-App

Chat-App is a web application built with Next.js, React, and MongoDB that allows users to chat and talk with people in real-time. Similar to Discord, Chat-App lets users add friends, block users, create channels, groups, or guilds. Users can also make voice and video calls with one another. Chat-App is an excellent solution for individuals or groups who want to communicate effectively and efficiently.

## Installation

1. Clone the repository: `git clone https://github.com/mart1d4/chat-app.git`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Features

-   Real-time chat
-   Voice calling (coming soon)
-   Video calling (coming soon)
-   Add friends
-   Block users
-   Create channels
-   Create groups
-   Create guilds (coming soon)

## Issue Tracker

-   [x] `Add Friends` popup closing when clicking on a user to add (working fine when fixed layer listens for `mousedown` instead of `click`)
-   [x] Some tooltips not rerendering when closing a fixed layer
-   [x] Some menus not opening in the correct position
-   [x] Menus going off screen when opening too close to the edge
-   [x] User profile content isn't scrolling but expanding instead
-   [x] Pusher triggers not properly configured
-   [x] Message improperly displayed in pin and delete popup
-   [ ] [Prisma Relations] disconnecting a channel from a user removes the user from the channel
-   [x] Need to recreate dm notification implementation in AppNav
-   [ ] Not always receiving websockets when sending a message to the channel the user is currently in
-   [ ] Channel receiving a `message-sent` websocket needs to display the channel item as active
-   [ ] `FixedLayer` components are being rerendered when clicking the buttons to close them
-   [x] Editing an image data using `enter` to submit the form doesn't always work
-   [ ] `UserCard` and `UserProfile` banner's `foreignObject` acting very weirdly when rendering with another foreignObject in the background
-   [x] Requesting a friend adds the user twice to the friends list (only way to fix is to refresh the page)
-   [ ] Editing/Replying to a message rerenders the entire channel
-   [ ] Clicking on an image to preview it sometimes takes a while to load and messes up the layout
-   [ ] Textarea still needs improvements; e.g. pasting text while having text selected doesn't always work as expected
-   [ ] Textarea content doesn't get cleared when sending a message

Please report any issues or bugs on the [GitHub Issue Tracker](https://github.com/mart1d4/chat-app/issues).

## Technologies Used

-   Next.js
-   React
-   MongoDB
-   Prisma
-   Pusher

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
