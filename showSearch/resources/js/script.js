var showData = null;

function doShowSearch() {
    let searchString = document.getElementById("searchString").value;
    console.log(searchString)
    axios({
        url: "/search/shows",
        method: "get",
        params: { search: searchString }
    }).then(res => {
        showData = res.data[0];
        showResults();
    })
    return false
}

function showResults() {
    if (!showData) {
        showNull();
    }
    document.getElementById("showDetails").classList.remove("invisible");
    document.getElementById("title").innerHTML = showData.show.name;
    let genreHTML = "";
    for (let genre in showData.show.genres) {
        console.log(genre);
        genreHTML += `<p>${showData.show.genres[genre]}</p>`;
    }
    document.getElementById("genres").innerHTML = genreHTML;
    document.getElementById("summary").innerHTML = showData.show.summary;
    if (!showData.show.rating.average) {
        showData.show.rating.average = "-";
    }
    document.getElementById("avgRating").innerHTML = showData.show.rating.average;
    if (!showData.show.image) {
        showData.show.image = "/img/404error.png";
        document.getElementById("poster").src = showData.show.image;
    }
    document.getElementById("poster").src = showData.show.image.medium;
    console.log(showData)
}

function showNull() {
    document.getElementById("title").innerHTML = "-";
    let genreHTML = "-"
    document.getElementById("genres").innerHTML = genreHTML;
    document.getElementById("summary").innerHTML = "-";
    document.getElementById("avgRating").innerHTML = "-";
    document.getElementById("poster").src = "/img/404error.png";
}

function prepareReviewModal() {
    document.getElementById("modalShowTitle").value = showData.show.name;
}

function saveReview() {
    let currentReview = document.getElementById("reviewText").value;
    console.log(currentReview);
    axios({
        url: "/save/review",
        method: "post",
        data: { title: showData.show.name, review: currentReview }
    }).then(res => {
        console.log(res);
        var myModalEl = document.getElementById('reviewModal');
        var modal = bootstrap.Modal.getInstance(myModalEl); // Returns a Bootstrap modal instance
        modal.toggle();
    })
}