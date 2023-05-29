let model = {
    selectedCountry: -1,
    articleCount: 5,
    countries: [

    ]
}


let eventsMediator = {
    events: {},
    on: function (eventName, callbackfn) {
        this.events[eventName] = this.events[eventName]
            ? this.events[eventName]
            : [];
        this.events[eventName].push(callbackfn);
    },
    emit: function (eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function (callBackfn) {
                callBackfn(data);
            });
        }
    },
};

let view = {
    init: function () {
        this.render();
    },
    renderCarousel: function () {
        $('#carousel-indicators').empty();
        $('#carousel-items').empty();
        for (let i = 0; i < model.countries.length; i++) {
            console.log(model.countries.length);
            $('#carousel-indicators').append(`<li data-bs-target="#flagsCarousel" data-bs-slide-to="${i}" ${(model.countries[i]["id"] == model.selectedCountry) || (model.selectedCountry == -1 && i == 0) ? 'class="active" aria-current="true"' : ''} aria-label="${model.countries[i].name}"></li>`)

            let div = `<div class="carousel-item ${(model.countries[i]["id"] == model.selectedCountry) || (model.selectedCountry == -1 && i == 0) ? 'active' : ''}">`;
            let img = `<img src="${model.countries[i].flag}" class="h-100 w-100 d-block rounded" alt="${model.countries[i].name}">`

            let carouselItem = $(div).append($(img));
            $('#carousel-items').append(carouselItem);
            carouselItem.click(function () {
                eventsMediator.emit("flag-click", model.countries[i]);
            });
        }
    },
    renderArticles: function () {
        $("#articles-list").empty();
        if (model.selectedCountry != -1) {
            if (model.countries[model.selectedCountry].articles.length != 0) {
                model.countries[model.selectedCountry].articles.slice(0, model.articleCount).forEach(article => {
                    const countryTemplate = {
                        title: article.title ? article.title : "Untitled",
                        author: article.author ? article.author : "Unknown",
                        date: article.publishedAt ? article.publishedAt : "Unknown",
                        url: article.url ? article.url : "",
                        source: article.source.name ? article.source.name : "Unknown",
                        img: article.urlToImage ? article.urlToImage : "",
                        description: article.description ? article.description : ""
                    }
                    let temp = document.getElementById("template");
                    const output = Mustache.render(temp.innerHTML, countryTemplate);

                    $("#articles-list").append(output);
                });
            }
            else {
                $("#articles-list").append(`<h1 class="text-center mt-2">No articles available for ${model.countries[model.selectedCountry].name}`)
            }
        }
    },
    render: function () {
        this.renderArticles();
        this.renderCarousel();
    }
}

let controller = {
    init: function () {
        eventsMediator.on("flag-click", function (countryData) { controller.setSelectedCountry(countryData); controller.getFlagData(countryData); });

        $.ajax({
            type: "get",
            url: "https://restcountries.com/v3.1/all?fields=name,flags,cca2",
            success: function (response) {
                for (let i = 0; i < response.length; i++) {
                    model.countries.push({
                        "id": i,
                        "name": response[i].name.common, // .name.common or .name.official
                        "code": response[i].cca2,
                        "flag": response[i].flags.png,
                        "articles": []
                    })
                }
                view.init();
            }
        });


    },
    setSelectedCountry(countryData) {
        model.selectedCountry = countryData.id;
    },
    getFlagData: function (countryData) {
        if (model.countries[countryData.id].articles.length == 0) {
            $.ajax({
                type: "get",
                url: "https://newsapi.org/v2/top-headlines?country=" + countryData.code + "&apiKey=421128645c344ec997484b2aa2426f6d",
                // data: "data",
                // dataType: "dataType",
                success: function (response) {
                    console.log(response);
                    // let articleList = response.articles.slice(0, 5);
                    let articleList = response.articles;
                    model.countries[countryData.id].articles = articleList;
                    console.log(articleList);
                    view.render();
                }
            });
            // let xhttp = new XMLHttpRequest();
            // xhttp.open("GET", "https://newsapi.org/v2/top-headlines?country=" + countryData.code + "&apiKey=421128645c344ec997484b2aa2426f6d", true);
            // xhttp.send();
            // xhttp.onload = () => {
            //     let articleList = JSON.parse(xhttp.responseText).articles.slice(0, 5);
            //     model.countries[countryData.id].articles = articleList;
            //     console.log(articleList);
            //     view.render();
            // }
        }
        else {
            view.render();
        }
    }
}

controller.init();