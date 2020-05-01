$(document).ready(function(e) {
    $("#btnTodayRecord").prop("disabled", true);
    $("#btnAllRecord").prop("disabled", false);

    $(window).on("load", function() {
        // alert("testing");
        handleClientLoad();
    });

    $("#loginButton").click(function(e) {
        handleClientLoad();
        clearTableContent();

        $("#btnTodayRecord").prop("disabled", true);
        $("#btnAllRecord").prop("disabled", false);
    });

    $("#signoutButton").click(function(e) {
        handleSignoutClick();
        clearTableContent();

        $("#btnTodayRecord").prop("disabled", true);
        $("#btnAllRecord").prop("disabled", true);

        //$("#div1").empty();
    });

    function clearTableContent() {
        $("#googleSheetResultTable tbody tr").remove();
    }

    $("#btnTodayRecord").click(function(e) {
        $("#btnTodayRecord").prop("disabled", true);
        $("#btnAllRecord").prop("disabled", false);

        makeApiCallToShowData(false);
    });

    $("#allRecord").click(function(e) {
        $("#btnTodayRecord").prop("disabled", false);
        $("#btnAllRecord").prop("disabled", true);

        makeApiCallToShowData(true);
    });

    /**
     *  Sign in the user upon button click.
     */
    function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
    }

    /**
     *  Sign out the user upon button click.
     */
    function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
    }

    function handleClientLoad() {
        gapi.load("client:auth2", initClient);
        handleAuthClick();
    }

    $("#submitData").click(function() {
        if (getInputValuesAndValidation()) {
            //alert(getInputStringForGoogleSheet());
            makeApiCallToInsertData();
        }
        //SubmitDataGoogleSheet()
        //makeApiCall()
    });

    $("#resetData").click(function() {
        resetFormData();
        resetFormDataDivValues();
    });

    function resetFormData() {
        $("#block option:first").prop("selected", true);
        $("#flatNo option:first").prop("selected", true);
        $("#vehicleType option:first").prop("selected", true);
        $("#vehicleNo").val("");
        $("#members option:first").prop("selected", true);
        $("#purpose").val("");
        $("#inOut option:first").prop("selected", true);
    }

    function resetFormDataDivValues() {
        $("#valueTempBlock").text($("#block option:selected").text());
        $("#valueTempFlatNo").text($("#flatNo option:selected").text());
        $("#valueTempVehicleType").text($("#vehicleType option:selected").text());
        $("#valueTempVehicleNo").text($("#vehicleNo").val());
        $("#valueTempMembers").text($("#members option:selected").text());
        $("#valueTempPurpose").text($("#purpose").val());
        $("#valueTempInOut").text($("#inOut option:selected").text());
    }

    var CLIENT_ID =
        "32851839446-pgje6jphg4cp2bpjkpb99g7hbo7eq51a.apps.googleusercontent.com";
    var API_KEY = "AIzaSyDApx97IEfZWugxvrFVywMDCAKGVFs4uls";

    // Array of API discovery doc URLs for APIs used by the quickstart
    var DISCOVERY_DOCS = [
        "https://sheets.googleapis.com/$discovery/rest?version=v4",
    ];

    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

    /**
     *  Sign out the user upon button click.
     */
    function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
    }

    function initClient() {
        gapi.client
            .init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES,
            })
            .then(
                function() {
                    // Listen for sign-in state changes.
                    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

                    // Handle the initial sign-in state.
                    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
                    //authorizeButton.onclick = handleAuthClick;
                    //signoutButton.onclick = handleSignoutClick;
                },
                function(error) {
                    appendPre(JSON.stringify(error, null, 2));
                }
            );
    }

    function updateSigninStatus(isSignedIn) {
        clearTableContent();
        if (isSignedIn) {
            $("#loginButton").hide();
            $("#signoutButton").show();
            $("#div1").show();
            makeApiCallToShowData(false);
        } else {
            $("#loginButton").show();
            $("#signoutButton").hide();
        }
    }

    function makeApiCallToShowData(showAllRecords) {
        gapi.client.sheets.spreadsheets.values
            .get({
                spreadsheetId: "1VuzOdRB1PKsdOfQ3aAqhUWncx13uyzL5GA1SO1Niab8",
                range: ["A1:z200"],
            })
            .then(
                function(response) {
                    var range = response.result;
                    if (range.values.length > 0) {
                        PopulateResult(range, showAllRecords);
                    } else {
                        appendPre("No data found.");
                    }
                },
                function(response) {
                    appendPre("Error: " + response.result.error.message);
                }
            );
    }

    function dateCompare(dateToCompare, showAllRecords) {
        if (showAllRecords) {
            return true;
        }
        var date = new Date();
        var currentDate =
            date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

        return currentDate == dateToCompare;
    }

    function PopulateResult(range, showAllRecords) {
        clearTableContent();

        var totalRows = range.values.length;
        var cellsInRow = 9;
        var counterStartValue;

        if (showAllRecords) {
            counterStartValue = 1;
        } else {
            counterStartValue = 0;
        }

        // Add remaning rows, whos transit date is current date
        for (var r = counterStartValue; r < totalRows; r++) {
            if (dateCompare(range.values[r][3], showAllRecords)) {
                //var row = document.createElement("tr");
                var rowData = "<tr>";
                // create cells in row
                for (var c = 0; c < cellsInRow - 1; c++) {
                    //var cell = document.createElement("td");
                    //var cellText = document.createTextNode(range.values[r][c]);
                    //cell.appendChild(cellText);
                    //row.appendChild(cell);
                    rowData = rowData + "<td>" + range.values[r][c] + "</td>";
                }
                rowData = rowData + "</tr>";

                $("#googleSheetResultTable tbody").append(rowData);
            }
        }
    }

    function PopulateTableToDiv(range) {
        var totalRows = range.values.length;
        var cellsInRow = 9;

        // get the reference for the body
        var div1 = document.getElementById("div1");

        // creates a <table> element
        var tbl = document.createElement("table");
        tbl.setAttribute("class", "TFtable");
        tbl.setAttribute("id", "googleSheetResultTable");

        // creating rows
        var row = document.createElement("tr");

        // create header cells in row
        for (var c = 0; c < cellsInRow - 1; c++) {
            var cell = document.createElement("th");
            var cellText = document.createTextNode(range.values[0][c]);
            cell.appendChild(cellText);
            row.appendChild(cell);
        }

        tbl.appendChild(row); // add the header row

        // Add remaning rows, whos transit date is current date
        for (var r = 0; r < totalRows; r++) {
            if (dateCompare(range.values[r][3])) {
                var row = document.createElement("tr");

                // create cells in row
                for (var c = 0; c < cellsInRow - 1; c++) {
                    var cell = document.createElement("td");
                    var cellText = document.createTextNode(range.values[r][c]);
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                }

                tbl.appendChild(row); // add the row to the end of the table body
            }
        }

        div1.appendChild(tbl); // appends <table> into <div1>
    }

    function makeApiCallToInsertData() {
        var params = {
            // The spreadsheet to apply the updates to.
            spreadsheetId: "1VuzOdRB1PKsdOfQ3aAqhUWncx13uyzL5GA1SO1Niab8",
        };

        var batchUpdateSpreadsheetRequestBody = {
            // A list of updates to apply to the spreadsheet.
            // Requests will be applied in the order they are specified.
            // If any request is not valid, no requests will be applied.
            requests: [{
                    insertRange: {
                        range: {
                            sheetId: 0,
                            startRowIndex: 1,
                            endRowIndex: 2,
                        },
                        shiftDimension: "ROWS",
                    },
                },
                {
                    pasteData: {
                        // "data": "B-205, 2, 1234, 25/04/2020, 12:15 PM, 12:30 PM, 1, test1, Dewas",
                        data: getInputStringForGoogleSheet(),
                        type: "PASTE_NORMAL",
                        delimiter: ",",
                        coordinate: {
                            sheetId: 0,
                            rowIndex: 1,
                        },
                    },
                },
            ],

            // TODO: Add desired properties to the request body.
        };

        var request = gapi.client.sheets.spreadsheets.batchUpdate(
            params,
            batchUpdateSpreadsheetRequestBody
        );
        request.then(
            function(response) {
                // TODO: Change code below to process the `response` object:
                //console.log(response.result);
                //alert(response.result)
                alert("Done");
                //$("#div1").html("");
                makeApiCallToShowData();
                resetFormData();
                resetFormDataDivValues();
            },
            function(reason) {
                //console.error('error: ' + reason.result.error.message);
                alert("Some wrong happen Try Afer Sometime!!!");
            }
        );
    }

    function SubmitDataGoogleSheet() {
        gapi.client.sheets.spreadsheets.values
            .get({
                spreadsheetId: "1VuzOdRB1PKsdOfQ3aAqhUWncx13uyzL5GA1SO1Niab8",
                range: ["A1:z200"],
            })
            .then(
                function(response) {
                    var range = response.result;
                    if (range.values.length > 0) {
                        alert(range.values.length);
                    } else {
                        appendPre("No data found.");
                    }
                },
                function(response) {
                    appendPre("Error: " + response.result.error.message);
                }
            );
    }

    $("#block").on("change", function() {
        $("#valueTempBlock").text($("#block option:selected").text());
    });

    $("#flatNo").on("change", function() {
        $("#valueTempFlatNo").text($("#flatNo option:selected").text());
    });

    $("#vehicleType").on("change", function() {
        $("#valueTempVehicleType").text($("#vehicleType option:selected").text());
    });

    $("#vehicleNo").on("change keyup paste", function() {
        getVehicleNo();
    });

    function getVehicleNo() {
        $("#valueTempVehicleNo").text($("#vehicleNo").val());
    }

    $("#members").on("change", function() {
        $("#valueTempMembers").text($("#members option:selected").text());
    });

    function getPurpose() {
        $("#valueTempPurpose").text($("#purpose").val());
    }

    $("#purpose").on("change keyup paste", function() {
        getPurpose();
    });

    $("#inOut").on("change", function() {
        $("#valueTempInOut").text($("#inOut option:selected").text());
    });

    var blockNo;
    var flatNo;
    var vehicleType;
    var vehicleNo;
    var currentDate;
    var members;
    var inTime;
    var outTime;
    var purpose;
    var userName;
    var inOut;

    function getInputValues() {
        blockNo = $("#valueTempBlock").text().trim();
        flatNo = $("#valueTempFlatNo").text().trim();
        vehicleType = $("#valueTempVehicleType").text().trim();
        vehicleNo = $("#valueTempVehicleNo").text().trim();
        currentDate = getCurrentDate().trim();
        members = $("#valueTempMembers").text().trim();

        var inOut = $("#valueTempInOut").text().trim();
        if (inOut == "In") {
            inTime = getCurrentTime().trim();
            outTime = "--";
        } else {
            inTime = "--";
            outTime = getCurrentTime().trim();
        }
        purpose = $("#valueTempPurpose").text().trim();
        userName = "Security";
    }

    function getInputValuesAndValidation() {
        getInputValues();

        if (vehicleNo == "" || vehicleNo == "--") {
            alert("Please enter Vehicle no");
            return false;
        }
        return true;
    }

    function getInputStringForGoogleSheet() {
        return (
            blockNo +
            "-" +
            flatNo +
            "," +
            "," +
            vehicleType +
            vehicleNo +
            "," +
            currentDate +
            "," +
            inTime +
            "," +
            outTime +
            "," +
            members +
            "," +
            purpose +
            "," +
            userName
        );
    }
});

function getCurrentDate() {
    var date = new Date();
    return (
        date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
    );
}

function getCurrentTime() {
    var time = new Date();
    return time.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });
}

$("#googleSheetResultTable").on("click", function() {
    alert("test");
});
