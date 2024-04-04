firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.

    } else {
        // No user is signed in.
        window.location.href = "login.html";
    }
});


const firestore = firebase.firestore();

const fetchDocument = async () => {
    try {
        const docRef = firestore.collection('settings').doc('1');
        const doc = await docRef.get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('title').value = data.title;
            document.getElementById('footer').value = data.footer;
            document.getElementById('backButtonText').value = data.backButtonText;
            document.getElementById('showRecommendedPosts').checked = data.settings.showRecommendedPosts;
            document.getElementById('showDate').checked = data.settings.showDate;
            document.getElementById('showReadingTime2').checked = data.settings.showReadingTime2;
            document.getElementById('showComments').checked = data.settings.showComments;
            document.getElementById('showImage2').checked = data.settings.showImage2;
            document.getElementById('showTags').checked = data.settings.showTags;
            document.getElementById('showDateF2').checked = data.settings.showDateF2;
            document.getElementById('showImage').checked = data.settings.showImage;
            document.getElementById('showDate2').checked = data.settings.showDate2;
            document.getElementById('showBackButton').checked = data.settings.showBackButton;
            document.getElementById('showViews2').checked = data.settings.showViews2;
            document.getElementById('allowComments').checked = data.settings.allowComments;
            document.getElementById('showSearch').checked = data.settings.showSearch;
            document.getElementById('showTitle').checked = data.settings.showTitle;
            document.getElementById('showReadingTime').checked = data.settings.showReadingTime;
            document.getElementById('showCopyCodeButton').checked = data.settings.showCopyCodeButton;
            document.getElementById('showViews').checked = data.settings.showViews;
            document.getElementById('defaultCommentName').value = data.defaultCommentName;
            document.getElementById('ads').value = data.ads;
            document.getElementById('defaultCommentAvatar').value = data.defaultCommentAvatar;
            document.getElementById('recomendedText').value = data.recomendedText;
            document.getElementById('addCommentText').value = data.addCommentText;
            document.getElementById('titleHeader').value = data.titleHeader;
            document.getElementById('nav').value = data.nav;
            document.getElementById("html").value = data.html1;
            document.getElementById('loadMoreTest').value = data.loadMoreTest;
            document.getElementById('commentsText').value = data.commentsText;
            document.getElementById('postsPerLoad').value = data.postsPerLoad;
            document.getElementById('modern').checked = data.settings.modernLook;
            document.getElementById('moderncss').value = data.customCssLink;

            // Display other document values here
        } else {
            console.log('Document not found!');
        }
    } catch (error) {
        console.error('Error fetching document:', error);
    }
};

const handleEdit = async () => {
    const docRef = firestore.collection('settings').doc('1');

    const backButtonText = document.getElementById('backButtonText').value;
    const showRecommendedPosts = document.getElementById('showRecommendedPosts').checked;
    const showDate = document.getElementById('showDate').checked;
    const showReadingTime2 = document.getElementById('showReadingTime2').checked;
    const showComments = document.getElementById('showComments').checked;
    const showImage2 = document.getElementById('showImage2').checked;
    const showTags = document.getElementById('showTags').checked;
    const showDateF2 = document.getElementById('showDateF2').checked;
    const showImage = document.getElementById('showImage').checked;
    const showDate2 = document.getElementById('showDate2').checked;
    const showBackButton = document.getElementById('showBackButton').checked;
    const showViews2 = document.getElementById('showViews2').checked;
    const allowComments = document.getElementById('allowComments').checked;
    const showSearch = document.getElementById('showSearch').checked;
    const showTitle = document.getElementById('showTitle').checked;
    const showReadingTime = document.getElementById('showReadingTime').checked;
    const showCopyCodeButton = document.getElementById('showCopyCodeButton').checked;
    const showViews = document.getElementById('showViews').checked;
    const defaultCommentName = document.getElementById('defaultCommentName').value;
    const ads = document.getElementById('ads').value;
    const defaultCommentAvatar = document.getElementById('defaultCommentAvatar').value;
    const recomendedText = document.getElementById('recomendedText').value;
    const addCommentText = document.getElementById('addCommentText').value;
    const titleHeader = document.getElementById('titleHeader').value;
    const nav = document.getElementById('nav').value;
    const loadMoreTest = document.getElementById('loadMoreTest').value;
    const commentsText = document.getElementById('commentsText').value;
    const title = document.getElementById('title').value;
    const footer = document.getElementById('footer').value;
    const html1 = document.getElementById('html').value;
    const postsPerLoad = Number(document.getElementById('postsPerLoad').value);
    const modernLook = document.getElementById('modern').checked;
    const customCssLink = document.getElementById('moderncss').value;

    try {
        await docRef.update({
            backButtonText,
            "settings.showRecommendedPosts": showRecommendedPosts,
            "settings.showDate": showDate,
            "settings.showReadingTime2": showReadingTime2,
            "settings.showComments": showComments,
            "settings.showImage2": showImage2,
            "settings.showTags": showTags,
            "settings.showDateF2": showDateF2,
            "settings.showImage": showImage,
            "settings.showDate2": showDate2,
            "settings.showBackButton": showBackButton,
            "settings.showViews2": showViews2,
            "settings.allowComments": allowComments,
            "settings.showSearch": showSearch,
            "settings.showTitle": showTitle,
            "settings.showReadingTime": showReadingTime,
            "settings.showCopyCodeButton": showCopyCodeButton,
            "settings.showViews": showViews,
            "settings.modernLook": modernLook,
            defaultCommentName,
            ads,
            defaultCommentAvatar,
            recomendedText,
            addCommentText,
            titleHeader,
            nav,
            loadMoreTest,
            commentsText,
            title,
            footer,
            html1,
            postsPerLoad,
            customCssLink

        });
        toast("Settings updated successfully!");
    } catch (error) {
        toast('Error updating data:', error);
    }
};


function toast(message, duration = 4500, delay = 0) {

    // Check for existing toast class elements

    const existingToast = document.querySelector('.toast5');

    if (existingToast) {
        existingToast.remove();
    }


    const toastContainer = document.createElement('div');
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '1rem';
    toastContainer.style.right = '1rem';
    toastContainer.style.display = 'flex';
    toastContainer.style.alignItems = 'center';
    toastContainer.style.justifyContent = 'center';
    toastContainer.style.width = '16rem';
    toastContainer.style.padding = '1rem';
    toastContainer.style.backgroundColor = '#1F2937';
    toastContainer.style.color = '#FFF';
    toastContainer.style.borderRadius = '0.25rem';
    toastContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.25)';
    toastContainer.style.overflow = 'auto';
    toastContainer.style.maxHeight = '500px';
    toastContainer.style.minWidth = '200px';
    toastContainer.style.width = 'fit-content';
    toastContainer.style.zIndex = '9999';
    toastContainer.setAttribute('class', 'toast5');

    const toastText = document.createElement('span');
    toastText.style.whiteSpace = 'nowrap';
    toastText.style.overflow = 'hidden';
    toastText.style.textOverflow = 'ellipsis';
    toastText.textContent = message;
    toastContainer.appendChild(toastText);

    document.body.appendChild(toastContainer);

    setTimeout(() => {
        toastContainer.style.opacity = '0';
        setTimeout(() => {
            toastContainer.remove();
        }, 300);
    }, duration + delay);

    toast.dismiss = function () {
        toastContainer.style.opacity = '0';
        setTimeout(() => {
            toastContainer.remove();
        }, 300);
    };
}

fetchDocument();