document.getElementById('createRoomButton').addEventListener('click', function() {
    document.getElementById('createRoomConfig').style.display = 'block';
    // Clear backlog when creating a new room
    document.getElementById('backlogList').innerHTML = '';
    localStorage.removeItem('backlog');
});

function generateRoomId() {
    return 'CME-' + Math.random().toString(36).substr(2, 9);
}

document.getElementById('generateRoomIdButton').addEventListener('click', function() {
    // Clear the backlog
    document.getElementById('backlogList').innerHTML = '';
    const roomId = generateRoomId();
    const generatedRoomIdElement = document.getElementById('generatedRoomId');
    generatedRoomIdElement.textContent = roomId;
    generatedRoomIdElement.style.display = 'block'; // Show the generated room ID
    // Show the 'Copy Room ID' button only if a room ID is generated
    if (roomId) {
        document.getElementById('copyGeneratedRoomIdButton').style.display = 'block';
        document.getElementById('addStoryButton').disabled = false; // Enable the 'Add Story' button
    }
    // Display the 'Create Room Configuration' section
    document.getElementById('createRoomConfig').style.display = 'block';
});

document.getElementById('copyGeneratedRoomIdButton').style.display = 'none'; // Initially hide the button

document.getElementById('copyGeneratedRoomIdButton').addEventListener('click', function() {
    const roomId = document.getElementById('generatedRoomId').textContent;
    navigator.clipboard.writeText(roomId).then(function() {
        displayMessage('Room ID copied to clipboard!', 'success');
    }, function(err) {
        console.error('Could not copy text: ', err);
        displayMessage('Failed to copy Room ID.', 'error');
    });
});

// Load backlog from local storage on page load
window.addEventListener('load', function() {
    const savedBacklog = JSON.parse(localStorage.getItem('backlog')) || [];
    const backlogList = document.getElementById('backlogList');
    savedBacklog.forEach(story => {
        const storyItem = document.createElement('li');
        storyItem.textContent = `Title: ${story.title}, Description: ${story.description}`;
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete';
        deleteButton.innerHTML = '<svg width="24" height="24" fill="red" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg> Delete';
        deleteButton.addEventListener('click', function() {
            storyItem.remove();
            saveBacklog();
        });
        storyItem.appendChild(deleteButton);
        backlogList.appendChild(storyItem);
    });
});

// Function to save backlog to local storage
function saveBacklog() {
    const backlogList = document.getElementById('backlogList');
    const stories = [];
    backlogList.querySelectorAll('li').forEach(item => {
        const [title, description] = item.textContent.replace('Title: ', '').replace('Description: ', '').split(', ');
        stories.push({ title, description });
    });
    localStorage.setItem('backlog', JSON.stringify(stories));
}

// Update add story function to include score dropdown and options
const addStoryButton = document.getElementById('addStoryButton');
addStoryButton.addEventListener('click', function() {
    const title = document.getElementById('storyTitle').value.trim();
    const description = document.getElementById('storyDescription').value.trim();

    // Check for duplicate titles
    const existingTitles = Array.from(document.querySelectorAll('#backlogList tr td:first-child')).map(td => td.textContent);
    if (existingTitles.includes(title)) {
        displayMessage('This story title already exists in the backlog.', 'error');
        return; // Exit the function if duplicate found
    }

    if (title) { // Only require a title
        const row = document.createElement('tr');
        const titleCell = document.createElement('td');
        titleCell.textContent = title;
        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = description;

        // Create a dropdown for score based on room type
        const scoreCell = document.createElement('td');
        const scoreDropdown = document.createElement('select');

        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '<>'; // Default option
        scoreDropdown.appendChild(defaultOption);

        const roomType = document.querySelector('input[name="roomType"]:checked').value; // Get the selected room type

        // Define score options based on room type
        let scoreOptions;
        if (roomType === 'Story') {
            scoreOptions = ['0', '1', '2', '3', '5', '8', '13', '21']; // Story score options
        } else if (roomType === 'Portfolio') {
            scoreOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']; // Portfolio score options
        }

        scoreOptions.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            scoreDropdown.appendChild(opt);
        });
        scoreCell.appendChild(scoreDropdown); // Append dropdown to score cell

        const optionsCell = document.createElement('td'); // New options cell

        // Create buttons for options
        const selectButton = document.createElement('button');
        selectButton.className = 'vote';
        selectButton.textContent = 'Vote';
        selectButton.addEventListener('click', function() {
            selectStoryForVoting(title);
        });

        const editButton = document.createElement('button');
        editButton.className = 'edit';
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', function() {
            const newTitle = prompt('Edit Title:', titleCell.textContent);
            const newDescription = prompt('Edit Description:', descriptionCell.textContent);
            if (newTitle !== null) {
                titleCell.textContent = newTitle;
            }
            if (newDescription !== null) {
                descriptionCell.textContent = newDescription;
            }
            saveBacklog();
            displayMessage('Story updated successfully!', 'success');
        });

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function() {
            row.remove();
            saveBacklog();
        });

        // Append buttons to options cell
        optionsCell.appendChild(selectButton);
        optionsCell.appendChild(editButton);
        optionsCell.appendChild(deleteButton);

        // Append cells to the row
        row.appendChild(titleCell);
        row.appendChild(descriptionCell);
        row.appendChild(scoreCell); // Append score cell with dropdown
        row.appendChild(optionsCell); // Append options cell to the row

        document.getElementById('backlogList').appendChild(row);
        saveBacklog();

        // Reset the input fields and character counts
        document.getElementById('storyTitle').value = '';
        document.getElementById('storyDescription').value = '';
        document.getElementById('titleCharCount').textContent = '100 characters remaining'; // Reset title character count
        document.getElementById('descriptionCharCount').textContent = '300 characters remaining'; // Reset description character count

        displayMessage('Story added successfully!', 'success');
    } else {
        displayMessage('Please enter a title for the story.', 'error');
    }
});

// Function to display room information
function displayRoomInfo(roomId, roomType) {
    const roomInfoSection = document.getElementById('roomInfo');
    roomInfoSection.style.display = 'block';
    document.getElementById('roomIdDisplay').textContent = `Room ID: ${roomId}`;
    document.getElementById('roomTypeDisplay').textContent = `Room Type: ${roomType}`;
    // Enable room-specific actions
    document.getElementById('poker').style.display = 'block';
    document.getElementById('users').style.display = 'block';
    document.getElementById('selections').style.display = 'block';
}

// Simulate user list
let usersInRoom = ['User1', 'User2'];

// Function to display users in the room
function displayUsers() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    usersInRoom.forEach(user => {
        const userItem = document.createElement('li');
        userItem.textContent = user;
        userList.appendChild(userItem);
    });
}

// Update joinRoom function to hide room joining elements
function joinRoom(roomId) {
    displayMessage(`Joining room with ID: ${roomId}`, 'info');
    const roomType = 'Story';
    displayRoomInfo(roomId, roomType);
    displayUsers();
    // Hide room joining elements
    document.getElementById('joinRoomButton').style.display = 'none';
    document.getElementById('createRoomButton').style.display = 'none';
    document.getElementById('joinCreatedRoomButton').style.display = 'none';
    document.querySelector('input[placeholder="Enter Room Code"]').style.display = 'none';
}

// Show join button after room creation
const generateRoomIdButton = document.getElementById('generateRoomIdButton');
generateRoomIdButton.addEventListener('click', function() {
    const roomId = document.getElementById('generatedRoomId').textContent;
    if (roomId) {
        document.getElementById('joinCreatedRoomButton').style.display = 'block';
    }
});

// Join created room
const joinCreatedRoomButton = document.getElementById('joinCreatedRoomButton');
joinCreatedRoomButton.addEventListener('click', function() {
    const roomId = document.getElementById('generatedRoomId').textContent;
    joinRoom(roomId);
    // Display the 'Create Room Configuration' section
    document.getElementById('createRoomConfig').style.display = 'block';
});

// Function to validate Room ID
function isValidRoomId(roomId) {
    // Placeholder validation logic
    // In a real application, this would check against a database or server
    return roomId.startsWith('room-');
}

// Join room using Room ID
const joinRoomButton = document.getElementById('joinRoomButton');
joinRoomButton.addEventListener('click', function() {
    document.querySelector('input[placeholder="Enter Room Code"]').style.display = 'block';
});

// Clear backlog
const clearBacklogButton = document.getElementById('clearBacklogButton');
clearBacklogButton.addEventListener('click', function() {
    document.getElementById('backlogList').innerHTML = '';
    localStorage.removeItem('backlog');
    displayMessage('Backlog cleared!', 'success');
});

// Object to store votes
let votes = {};

// Function to save votes to local storage
function saveVotes() {
    localStorage.setItem('votes', JSON.stringify(votes));
    console.log('Votes saved to local storage:', votes);
}

// Function to load votes from local storage
function loadVotes() {
    const savedVotes = JSON.parse(localStorage.getItem('votes')) || {};
    votes = savedVotes;
    console.log('Votes loaded from local storage:', votes);
}

// Call loadVotes on page load
window.addEventListener('load', loadVotes);

// Consolidate timer logic
let votingTimer;
let timeRemaining = 5; // Default timer length in seconds
let timerRunning = false; // Track if the timer is running

document.getElementById('startVotingButton').addEventListener('click', function() {
    startVotingTimer();
});

function startVotingTimer() {
    if (timerRunning) return; // Prevent starting the timer again
    timeRemaining = parseInt(document.getElementById('votingTimeSelect').value); // Get selected time
    document.getElementById('timerDisplay').style.display = 'block';
    document.getElementById('timeRemaining').textContent = timeRemaining;
    document.getElementById('timerMessage').style.display = 'none'; // Hide any previous messages
    timerRunning = true; // Set timer as running

    votingTimer = setInterval(function() {
        timeRemaining--;
        document.getElementById('timeRemaining').textContent = timeRemaining;

        if (timeRemaining <= 0) {
            clearInterval(votingTimer);
            timerRunning = false; // Reset timer running status
            document.getElementById('timerDisplay').style.display = 'none';
            document.getElementById('timerMessage').textContent = "Voting time is up!"; // Inline message
            document.getElementById('timerMessage').style.display = 'block'; // Show the message
            revealResults(); // Automatically reveal results when time is up
        }
    }, 1000);
}

// Update handleVote to save votes
function handleVote(option) {
    // Highlight the selected vote
    const selectionList = document.getElementById('selectionList');
    selectionList.querySelectorAll('.card').forEach(card => {
        if (card.textContent === option) {
            card.style.backgroundColor = '#ffeb3b'; // Highlight color
        } else {
            card.style.backgroundColor = ''; // Reset other cards
        }
    });

    // Record the vote
    votes = {}; // Clear previous votes
    votes[option] = 1; // Set the current vote
    console.log('Current votes:', votes);

    // Save votes to local storage
    saveVotes();

    // Provide feedback to the user
    const feedback = document.getElementById('feedback');
    feedback.textContent = `You voted for: ${option}`;
    feedback.className = 'success';
    feedback.style.display = 'block';
    setTimeout(() => {
        feedback.style.display = 'none';
    }, 2000);
}

// Function to display voting options as cards
function displayVotingOptions(roomType) {
    const selectionList = document.getElementById('selectionList');
    selectionList.innerHTML = '';
    const options = roomType === 'Story' ? ['1', '2', '3', '5', '8', '13', '21', '??'] : ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    options.forEach(option => {
        const optionItem = document.createElement('li');
        const card = document.createElement('div');
        card.className = 'card';
        card.textContent = option;
        card.addEventListener('click', function() {
            handleVote(option);
            document.getElementById('selections').style.display = 'none'; // Hide after vote is selected
        });
        optionItem.appendChild(card);
        selectionList.appendChild(optionItem);
    });
}

// Function to show the action modal
function showActionModal() {
    const modal = document.getElementById('actionModal');
    modal.style.display = 'block';
}

// Function to hide the action modal
function hideActionModal() {
    const modal = document.getElementById('actionModal');
    modal.style.display = 'none';
}

// Set up event listeners for modal buttons
const closeModalButton = document.getElementById('closeModal');
closeModalButton.addEventListener('click', hideActionModal);

// Show the modal when results are revealed
function revealResults() {
    const resultsBody = document.getElementById('resultsBody');
    resultsBody.innerHTML = ''; // Clear previous results

    let maxVote = -Infinity; // Highest card selected
    let minVote = Infinity; // Lowest card selected
    let totalVotes = 0; // Initialize total votes

    // Assuming votes is an object where keys are options and values are vote counts
    for (const [option, count] of Object.entries(votes)) {
        const row = document.createElement('tr');
        const optionCell = document.createElement('td');
        optionCell.textContent = option; // This is the vote (card value)
        const countCell = document.createElement('td');
        countCell.textContent = count; // This is the count of votes
        row.appendChild(optionCell);
        row.appendChild(countCell);
        resultsBody.appendChild(row);

        // Update max and min votes based on the option (card value)
        const cardValue = parseInt(option); // Convert option to integer for comparison
        if (cardValue > maxVote) {
            maxVote = cardValue; // Update maxVote if current card is higher
        }
        if (cardValue < minVote) {
            minVote = cardValue; // Update minVote if current card is lower
        }
        totalVotes += count; // Accumulate total votes
    }

    // Display max, min, and total votes
    document.getElementById('maxVote').textContent = `Highest Card Selected: ${maxVote}`;
    document.getElementById('minVote').textContent = `Lowest Card Selected: ${minVote}`;
    document.getElementById('totalVotes').textContent = `Total Count of Voters: ${totalVotes}`; // Show total votes
    document.getElementById('summaryResults').style.display = 'block'; // Show the summary results

    // Show the action buttons after voting results
    document.getElementById('actionButtons').style.display = 'block'; // Show action buttons
    document.getElementById('votingResults').style.display = 'block'; // Show the results table
}

// Show feedback controls when voting starts
function showFeedbackControls() {
    document.getElementById('feedbackControls').style.display = 'block';
}

// Function to display messages inline near the mouse cursor
function displayMessage(message, type = 'info', event = null) {
    const messageDisplay = document.getElementById('messageDisplay');
    messageDisplay.textContent = message;
    messageDisplay.className = `message ${type}`;
    if (event) {
        messageDisplay.style.left = `${event.pageX + 10}px`;
        messageDisplay.style.top = `${event.pageY + 10}px`;
    } else {
        messageDisplay.style.left = '50%';
        messageDisplay.style.top = '10px';
        messageDisplay.style.transform = 'translateX(-50%)';
    }
    messageDisplay.style.display = 'block';
    setTimeout(() => {
        messageDisplay.style.display = 'none';
    }, 3000);
}

// Update selectStoryForVoting to show start timer button
function selectStoryForVoting(storyTitle) {
    displayMessage(`Selected story for voting: ${storyTitle}`, 'info');
    const roomType = document.querySelector('input[name="roomType"]:checked').value;
    displayVotingOptions(roomType);
    showFeedbackControls();
    document.getElementById('feedbackControls').style.display = 'block';
    // Highlight the selected story in the backlog
    const backlogList = document.getElementById('backlogList');
    backlogList.querySelectorAll('tr').forEach(row => {
        if (row.firstChild.textContent === storyTitle) {
            row.style.backgroundColor = '#ffeb3b'; // Highlight color
        } else {
            row.style.backgroundColor = '';
        }
    });
}

document.getElementById('addStoryButton').disabled = true; // Initially disable the 'Add Story' button

const roomCodeInput = document.getElementById('roomCodeInput');
const submitRoomCodeButton = document.getElementById('submitRoomCodeButton');

// Show the submit button when the room code input is displayed
joinRoomButton.addEventListener('click', function() {
    roomCodeInput.style.display = 'block';
    submitRoomCodeButton.style.display = 'block';
});

// Add event listener for the submit button
submitRoomCodeButton.addEventListener('click', function() {
    const roomId = roomCodeInput.value;
    if (roomId) {
        joinRoom(roomId);
    } else {
        displayMessage('Please enter a Room ID.', 'error');
    }
});

// Allow pressing Enter to submit the room code
roomCodeInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        submitRoomCodeButton.click();
    }
});

function updateBacklogDisplay() {
    const backlogList = document.getElementById('backlogList');
    backlogList.innerHTML = '';
    const savedBacklog = JSON.parse(localStorage.getItem('backlog')) || [];
    savedBacklog.forEach(story => {
        const row = document.createElement('tr');
        const titleCell = document.createElement('td');
        titleCell.textContent = story.title;
        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = story.description;
        const deleteCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete';
        deleteButton.innerHTML = '<svg width="24" height="24" fill="red" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg> Delete';
        deleteButton.addEventListener('click', function() {
            row.remove();
            saveBacklog();
        });
        const selectButton = document.createElement('button');
        selectButton.className = 'vote';
        selectButton.innerHTML = '<svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z"/><path d="M10.97 6.97a.75.75 0 0 1 1.07 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L5.324 9.384a.75.75 0 1 1 1.06-1.06l1.094 1.093 3.492-4.437z"/></svg> Vote';
        selectButton.addEventListener('click', function() {
            selectStoryForVoting(title);
        });
        const editButton = document.createElement('button');
        editButton.className = 'edit';
        editButton.innerHTML = '<svg width="24" height="24" fill="blue" viewBox="0 0 16 16"><path d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-4 1a.5.5 0 0 1-.63-.63l1-4a.5.5 0 0 1 .11-.168l10-10zM11.207 3L3 11.207V13h1.793L13 4.793 11.207 3zM14 2.5 13.5 2 12 3.5l.5.5L14 2.5z"/></svg> Edit Button';
        editButton.addEventListener('click', function() {
            const newTitle = prompt('Edit Title:', titleCell.textContent);
            const newDescription = prompt('Edit Description:', descriptionCell.textContent);
            if (newTitle !== null) {
                titleCell.textContent = newTitle;
            }
            if (newDescription !== null) {
                descriptionCell.textContent = newDescription;
            }
            saveBacklog();
            displayMessage('Story updated successfully!', 'success');
        });
        deleteCell.appendChild(selectButton);
        deleteCell.appendChild(editButton);
        deleteCell.appendChild(deleteButton);
        row.appendChild(titleCell);
        row.appendChild(descriptionCell);
        row.appendChild(deleteCell);
        document.getElementById('backlogList').appendChild(row);
    });
}

// Call updateBacklogDisplay on page load
window.addEventListener('load', updateBacklogDisplay);

document.getElementById('toggleRoomDetailsButton').addEventListener('click', function() {
    const roomDetails = document.getElementById('roomDetails');
    if (roomDetails.style.display === 'none') {
        roomDetails.style.display = 'block';
        this.textContent = 'Hide Room Details';
    } else {
        roomDetails.style.display = 'none';
        this.textContent = 'Show Room Details';
    }
});

// Add this function to handle full screen display of the backlog
function showFullScreenBacklog() {
    const backlogSection = document.getElementById('backlog');
    const fullScreenDiv = document.createElement('div');
    fullScreenDiv.style.position = 'fixed';
    fullScreenDiv.style.top = '0';
    fullScreenDiv.style.left = '0';
    fullScreenDiv.style.width = '100%';
    fullScreenDiv.style.height = '100%';
    fullScreenDiv.style.backgroundColor = 'white';
    fullScreenDiv.style.zIndex = '1000';
    fullScreenDiv.style.overflow = 'auto';
    fullScreenDiv.innerHTML = `
        <h2>
            Full Screen Backlog 
            <svg id="emailIcon" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" style="vertical-align: middle; margin-left: 5px; cursor: pointer;">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.5l7 4.5 7-4.5V4a1 1 0 0 0-1-1H2zm0 10h12a1 1 0 0 0 1-1v-4.5l-7 4.5-7-4.5V13a1 1 0 0 0 1 1z"/>
            </svg>
        </h2>
        <input type="email" id="emailInput" placeholder="Enter email address" style="width: 100%; margin-bottom: 10px;">
        <button id="sendEmailButton">Send Email</button>
        <button id="closeFullScreenButton">Close</button>
        <table id="fullScreenBacklogTable">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody id="fullScreenBacklogList">
                ${Array.from(document.querySelectorAll('#backlogList tr')).map(row => {
                    const title = row.children[0].textContent;
                    const description = row.children[1].textContent;
                    const score = row.children[2].querySelector('select').value; // Get the score from the dropdown
                    return `
                        <tr>
                            <td>${title}</td>
                            <td>${description}</td>
                            <td>${score}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    document.body.appendChild(fullScreenDiv);

    // Add event listener to close the full screen
    document.getElementById('closeFullScreenButton').addEventListener('click', function() {
        document.body.removeChild(fullScreenDiv);
    });

    // Add event listener to send email
    document.getElementById('sendEmailButton').addEventListener('click', function() {
        const email = document.getElementById('emailInput').value;
        if (email) {
            // Get the current date and time
            const now = new Date();
            const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            // Set the subject with the specified format
            const subject = encodeURIComponent(`Story Skyzer ${formattedDate}`);
            
            // Generate the email body with backlog content
            const body = encodeURIComponent(generateBacklogEmailContent() + '\nThank you for using Story Skyzer');
            
            // Open a new tab with the mailto link
            window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
        } else {
            alert('Please enter a valid email address.');
        }
    });
}

// Function to generate the email content from the backlog
function generateBacklogEmailContent() {
    const backlogItems = Array.from(document.querySelectorAll('#backlogList tr'));
    return backlogItems.map(row => {
        const title = row.children[0].textContent;
        const description = row.children[1].textContent;
        const score = row.children[2].querySelector('select').value;
        return `Title: ${title}\nDescription: ${description}\nScore: ${score}\n`;
    }).join('\n');
}

// Attach the event listener to the magnifying glass icon
document.getElementById('magnifyingGlass').addEventListener('click', showFullScreenBacklog);

function updateCharacterCount() {
    const titleInput = document.getElementById('storyTitle');
    const charCountDisplay = document.getElementById('titleCharCount');
    const maxLength = 100;
    const currentLength = titleInput.value.length;
    const remainingChars = maxLength - currentLength;

    charCountDisplay.textContent = `${remainingChars} characters remaining`;
}

function updateDescriptionCharacterCount() {
    const descriptionInput = document.getElementById('storyDescription');
    const charCountDisplay = document.getElementById('descriptionCharCount');
    const maxLength = 300;
    const currentLength = descriptionInput.value.length;
    const remainingChars = maxLength - currentLength;

    charCountDisplay.textContent = `${remainingChars} characters remaining`;
}

let currentFontSize = 16; // Default font size in pixels

function increaseTextSize() {
    currentFontSize += 2; // Increase font size by 2 pixels
    updateBacklogFontSize();
}

function decreaseTextSize() {
    currentFontSize = Math.max(10, currentFontSize - 2); // Decrease font size by 2 pixels, minimum 10 pixels
    updateBacklogFontSize();
}

function updateBacklogFontSize() {
    const backlogTable = document.getElementById('backlogTable');
    backlogTable.style.fontSize = `${currentFontSize}px`; // Update the font size of the backlog table
}

// Event listeners for the text size buttons
document.getElementById('increaseTextSizeButton').addEventListener('click', increaseTextSize);
document.getElementById('decreaseTextSizeButton').addEventListener('click', decreaseTextSize);

document.addEventListener('DOMContentLoaded', function() {
    // Existing code...

    // Toggle summary results visibility
    document.getElementById('toggleSummaryButton').addEventListener('click', function() {
        const summaryContent = document.getElementById('summaryContent');
        if (summaryContent.style.display === 'none') {
            summaryContent.style.display = 'block';
            this.textContent = 'Hide Summary'; // Change button text
        } else {
            summaryContent.style.display = 'none';
            this.textContent = 'Show Summary'; // Change button text
        }
    });

    // Existing code...
});