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

-   [x] Add Friends' popup closing when clicking on user to add them (working fine when fixed layer's listens for `mousedown` instead of `click`)
-   [x] Some tooltips not reappearing when closing a popup
-   [x] Some menus not opening in the correct position
-   [x] Menus going off screen when opening if too close to the edge
-   [x] User profile content isn't scrolling and expanding instead
-   [x] Pusher triggers not properly configured
-   [x] Message improperly displayed when pinning or deleting a message
-   [ ] Prisma Relations: disconnecting a channel from a user removes the user from the channel
-   [x] Need to recreate dm notification implementation in AppNav
-   [ ] Not receiving websocket when sending message in channel
-   [ ] Channel that receives new message websockets need to display channel item as active
-   [ ] Fixed layer components are being rerendered when clicking the buttons to close them
-   [ ] Editing an image data using `enter` to submit the form doesn't always work
-   [ ] User card and User profile banner's `foreignObject` acting very weirdly when rendering with another foreignObject in the background

Please report any issues or bugs on the [GitHub Issue Tracker](https://github.com/mart1d4/chat-app/issues).

## Technologies Used

-   Next.js
-   React
-   MongoDB
-   Prisma
-   Pusher

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
