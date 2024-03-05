const avatars = [
    "178ba6e1-5551-42f3-b199-ddb9fc0f80de",
    "9a5bf989-b884-4f81-b26c-ca1995cdce5e",
    "7cb3f75d-4cad-4023-a643-18c329b5b469",
    "220b2392-c4c5-4226-8b91-2b60c5a13d0f",
    "51073721-c1b9-4d47-a2f3-34f0fbb1c0a8",
];

export function getRandomAvatar(id: string) {
    // Generate a random number between 0 and 4
    // number should be calculated based on the id
    // use a simple hash function to calculate the number
    // and then return the avatar based on that number

    const hash = id.split("").reduce((acc, char) => {
        return acc + char.charCodeAt(0);
    }, 0);

    return avatars[hash % 5];
}
