// Function to retrieve and display errors
function displayErrors() {
    var db = firebase.firestore();
    var errorsRef = db.collection('analytics_errors');

    errorsRef.get()
        .then(function (querySnapshot) {
            var errors = [];
            querySnapshot.forEach(function (doc) {
                var error = doc.data();
                error.id = doc.id;
                errors.push(error);
            });
            renderErrors(errors);
        })
        .catch(function (error) {
            console.error('Error getting errors: ', error);
        });
}

// Function to render errors on the webpage
function renderErrors(errors) {
    var errorGroups = groupErrors(errors);

    var container = document.getElementById('error-container');
    container.innerHTML = '';

    errorGroups.forEach(function (group) {
        var errorGroupElement = document.createElement('div');
        errorGroupElement.classList.add('error-group');

        var errorTypeElement = document.createElement('h2');
        errorTypeElement.innerText = group.errorType;
        errorGroupElement.appendChild(errorTypeElement);

        group.errors.forEach(function (error) {
            var errorElement = createErrorElement(error);
            errorGroupElement.appendChild(errorElement);
        });

        container.appendChild(errorGroupElement);
    });
}

// Function to group errors by error type
function groupErrors(errors) {
    var groups = [];
    errors.forEach(function (error) {
        var group = groups.find(function (g) {
            return g.errorType === error.errorMessage;
        });
        if (group) {
            group.errors.push(error);
        } else {
            groups.push({
                errorType: error.errorMessage,
                errors: [error]
            });
        }
    });
    return groups;
}

// Function to create an error element
function createErrorElement(error) {
    var errorElement = document.createElement('div');
    errorElement.classList.add('error');

    var errorMessageElement = document.createElement('p');
    errorMessageElement.innerText = error.errorMessage;
    errorElement.appendChild(errorMessageElement);

    var viewButton = document.createElement('button');
    viewButton.innerText = 'View Details';
    viewButton.addEventListener('click', function () {
        showDetails(error);
    });
    errorElement.appendChild(viewButton);

    var deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete Error';
    deleteButton.addEventListener('click', function () {
        deleteError(error.id);
    });
    errorElement.appendChild(deleteButton);

    return errorElement;
}

// Function to show error details
function showDetails(error) {
    // Show detailed information about the error (e.g., error stack trace)
    console.log('Error ID: ', error.id);
    console.log('Error Message: ', error.errorMessage);
    console.log('Error Stack Trace: ', error.errorStack);
    // ...
}

// Function to delete an error
function deleteError(errorId) {
    var db = firebase.firestore();
    var errorsRef = db.collection('analytics_errors');

    errorsRef.doc(errorId).delete()
        .then(function () {
            console.log('Error deleted successfully.');
            displayErrors(); // Refresh the error display after deletion
        })
        .catch(function (error) {
            console.error('Error deleting error: ', error);
        });
}


let data = null;
let fbData = null;

// Function to retrieve and display analytics data
function displayAnalytics() {
    var db = firebase.firestore();
    var analyticsRef = db.collection('analytics');

    analyticsRef.get()
        .then(function (querySnapshot) {
            fbData = querySnapshot;
            var analyticsData = [];
            querySnapshot.forEach(function (doc) {
                var data = doc.data();
                data.id = doc.id;
                analyticsData.push(data);
            });
            renderAnalytics(analyticsData);
        })
        .catch(function (error) {
            console.error('Error getting analytics data: ', error);
        });
}


// Function to render analytics data on the webpage
function renderAnalytics(analyticsData) {
    fbData = analyticsData;
    data = groupData(analyticsData);
    displayData(data);
}

// Function to group analytics data by year, month, day, and post
function groupData(analyticsData) {
    var groupedData = {};

    analyticsData.forEach(function (data) {
        var timestamp = data.timestamp.toDate();
        var year = timestamp.getFullYear();
        var month = timestamp.getMonth() + 1; // Months are zero-based
        var day = timestamp.getDate();
        var post = data.currentPage === 'homepage' ? 'Homepage' : data.currentPage;

        if (!groupedData[year]) {
            groupedData[year] = {};
        }

        if (!groupedData[year][month]) {
            groupedData[year][month] = {};
        }

        if (!groupedData[year][month][day]) {
            groupedData[year][month][day] = {};
        }

        if (!groupedData[year][month][day][post]) {
            groupedData[year][month][day][post] = [];
        }

        groupedData[year][month][day][post].push(data);
    });

    return groupedData;
}

function createCollapsibleElement(title, content) {
    const container = document.createElement('div');
    container.classList.add('collapsible');

    const header = document.createElement('div');
    header.classList.add('collapsible-header');
    header.textContent = title;

    const body = document.createElement('div');
    body.classList.add('collapsible-body');
    body.appendChild(content);

    container.appendChild(header);
    container.appendChild(body);

    header.addEventListener('click', () => {
        container.classList.toggle('collapsed');
        body.classList.toggle('collapsed');
    });

    return container;
}

function displayData(data) {
    const analyticsContainer = document.getElementById('analytics');

    for (const year in data) {
        const yearData = data[year];
        const yearHeading = document.createElement('h2');
        yearHeading.textContent = year;

        const monthsContainer = document.createElement('div');
        monthsContainer.classList.add('months');

        for (const month in yearData) {
            const monthData = yearData[month];
            const monthDiv = document.createElement('div');
            monthDiv.classList.add('month');

            const monthHeading = document.createElement('h3');
            monthHeading.textContent = getMonthName(parseInt(month));
            monthDiv.appendChild(monthHeading);

            const daysContainer = document.createElement('div');
            daysContainer.classList.add('days');

            for (const day in monthData) {
                const dayData = monthData[day];
                const dayDiv = document.createElement('div');
                dayDiv.classList.add('day');

                const dayHeading = document.createElement('h4');
                dayHeading.textContent = `${parseInt(day)}th`;
                dayDiv.appendChild(dayHeading);

                const postsContainer = document.createElement('div');
                postsContainer.classList.add('posts');

                for (const post in dayData) {
                    const postVisitors = dayData[post];

                    const postDiv = document.createElement('div');
                    postDiv.classList.add('post');

                    const postHeading = document.createElement('h5');
                    postHeading.textContent = `Post: ${post}`;
                    postDiv.appendChild(postHeading);

                    const visitorsList = document.createElement('ul');
                    visitorsList.classList.add('visitors');

                    postVisitors.forEach(visitor => {
                        const visitorItem = document.createElement('li');
                        visitorItem.innerHTML = `
                <span>User ID: ${visitor.userId}</span>
                <span>Timestamp: ${visitor.timestamp.seconds}</span>
                <span>Browser Info: ${visitor.browserInfo.userAgent}</span>
                <span>IP Address: ${visitor.ipAddress}</span>
              `;
                        visitorsList.appendChild(visitorItem);
                    });

                    postDiv.appendChild(visitorsList);
                    postsContainer.appendChild(postDiv);
                }

                dayDiv.appendChild(postsContainer);
                daysContainer.appendChild(dayDiv);
            }

            monthDiv.appendChild(daysContainer);
            monthsContainer.appendChild(monthDiv);
        }

        const collapsibleElement = createCollapsibleElement(year, monthsContainer);
        analyticsContainer.appendChild(collapsibleElement);
    }
}

function getMonthName(monthNumber) {
    const months = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
}



// displayAnalytics();
// displayErrors();

let db = firebase.firestore();

let dd = null;

async function getAnalyticsData() {
    if (dd !== null) return dd;

    const snapshot = await db.collection('analytics').get();


    const browserCounts = new Map();
    const postCounts = new Map();
    const platformCounts = new Map();
    const languageCounts = new Map();

    snapshot.forEach((doc) => {
        const data = doc.data();
        const browserInfo = data.browserInfo;
        const userAgent = browserInfo.userAgent;

        const browserInfo2 = extractBrowserInfo(userAgent);

        const browser = `${browserInfo2.browserName} / ${browserInfo2.browserVersion}`;//.split(' ')[0]; // Extract the browser from the user agent string

        if (browserCounts.has(browser)) {
            browserCounts.set(browser, browserCounts.get(browser) + 1);
        } else {
            browserCounts.set(browser, 1);
        }

        const post = data.post;

        if (postCounts.has(post)) {
            postCounts.set(post, postCounts.get(post) + 1);
        } else {
            postCounts.set(post, 1);
        }

        const platform = browserInfo.platform;

        if (platformCounts.has(platform)) {
            platformCounts.set(platform, platformCounts.get(platform) + 1);
        } else {
            platformCounts.set(platform, 1);
        }

        const language = browserInfo.language;

        if (languageCounts.has(language)) {
            languageCounts.set(language, languageCounts.get(language) + 1);
        } else {
            languageCounts.set(language, 1);
        }
    });

    const browsers = Array.from(browserCounts.entries()).map(([browser, count]) => ({
        name: browser,
        count: count,
    }));

    const posts = Array.from(postCounts.entries()).map(([post, count]) => ({
        name: post,
        count: count,
    }));

    const platforms = Array.from(platformCounts.entries()).map(([platform, count]) => ({
        name: platform,
        count: count,
    }));

    const languages = Array.from(languageCounts.entries()).map(([language, count]) => ({
        name: language,
        count: count,
    }));

    dd = {
        browsers,
        posts,
        platforms,
        languages,
    };

    return {
        browsers,
        posts,
        platforms,
        languages,
    };
}


function extractBrowserInfo(userAgent) {
    const regex = /(Firefox|Chrome|Safari|Edge|IE|Opera)[/ ]([0-9.]+)/;
    const match = userAgent.match(regex);

    if (match) {
        const browserName = match[1];
        const browserVersion = match[2];
        return { browserName, browserVersion };
    }

    return null; // Return null if no match found
}

async function generateBrowserChart() {
    const analyticsData = await getAnalyticsData();

    const browserLabels = analyticsData.browsers.map((data) => data.name);
    const browserCounts = analyticsData.browsers.map((data) => data.count);

    const ctx = document.getElementById('browserChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: browserLabels,
            datasets: [
                {
                    label: 'Browser Usage',
                    data: browserCounts,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}

async function generateMostPopularPostsChart() {
    const analyticsData = await getAnalyticsData();

    const postLabels = analyticsData.posts.map((data) => data.name);
    const postCounts = analyticsData.posts.map((data) => data.count);

    const ctx = document.getElementById('popularPostsChart').getContext('2d');
    new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: postLabels,
            datasets: [
                {
                    label: 'Most Popular Posts',
                    data: postCounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true,
                },
            },
        },
    });
}


async function generatePlatformChart() {
    const analyticsData = await getAnalyticsData();

    const platformLabels = analyticsData.platforms.map((data) => data.name);
    const platformCounts = analyticsData.platforms.map((data) => data.count);

    const ctx = document.getElementById('platformChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: platformLabels,
            datasets: [
                {
                    label: 'Platform Distribution',
                    data: platformCounts,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        },
    });
}

async function generateLanguageChart() {
    const analyticsData = await getAnalyticsData();

    const languageLabels = analyticsData.languages.map((data) => data.name);
    const languageCounts = analyticsData.languages.map((data) => data.count);

    const ctx = document.getElementById('languageChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: languageLabels,
            datasets: [
                {
                    label: 'Language Distribution',
                    data: languageCounts,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        },
    });
}



generateBrowserChart();
generateMostPopularPostsChart();
generatePlatformChart();
generateLanguageChart();
