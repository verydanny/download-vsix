browser.tabs.query({active: true, lastFocusedWindow: true}).then(function(tabs) {
    let tab = tabs[0];
    let url = URL.parse(tab.url);
    let path = url.hostname + url.pathname;

    //Check for valid URL - though it should be filtered by manifest anyway
    if (path == "marketplace.visualstudio.com/items") {
        //Check for a valid query
        let params = url.searchParams;
        if (params.has("itemName"))
        {
            [author, package] = params.get("itemName").split(".");

            //Get latest version from API
            fetch("https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery?api-version=3.0-preview.1", {
                method: "POST",
                body: JSON.stringify({
                    filters:[{
                    pageNumber:1,
                    pageSize:1,
                    criteria:[{
                        filterType: 7, //Filter by name
                        value: `${author}.${package}`
                    }]
                    }],
                    assetTypes: [], //Shouldn't be needed
                    flags: 1 //Include version info
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(function(versionRequest) {
                if (versionRequest.ok) {
                    versionRequest.json().then(function(requestJson) {
                        const releases = requestJson.results[0].extensions[0].versions;
                        let table = document.getElementById("versionTbl");
                        let versionsInfo = [];

                        for (const element of releases) {
                            const version = element.version;
                            if (!(versionsInfo.includes(version))) {
                                versionsInfo.push(version);

                                //Add to the table
                                const row = document.createElement("tr");

                                const ver = document.createElement("td");
                                const link = document.createElement("a");
                                link.setAttribute("href", `https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${author}/vsextensions/${package}/${version}/vspackage`)
                                link.append(version);
                                ver.append(link);
                                row.append(ver);

                                const dateCell = document.createElement("td");
                                const date = new Date(element.lastUpdated);
                                dateCell.append(date.toISOString().substring(0,10))
                                row.append(dateCell);
                                table.append(row);
                            }
                        }
                    });
                }
            });
            
        }
    }
})