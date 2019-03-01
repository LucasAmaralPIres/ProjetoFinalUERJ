var pagination = {page: 1, dataPerPage: 15};
var totalPages = 0;
var subjects = [];
var actualClass = null;
var actualSubject = null;
var actualDate = null;
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

$(document).ready(function(){
	getSubject(function(){
		$("#div-numClass").hide();
		$("#info-modal-numClass-toggle").hide();
		searchFilter(true);
	});
});

var getSubject = function(callback){
    $.get("/Subject/getAll", function(response){
        subjects = response.data;
        prepareSubjectSelect();
        callback();
    });
};

var prepareSubjectSelect = function(){
    string = "<option value=''>Choose one...</option>";
    $.each(subjects, function(index, value){
        string += "<option value='"+ value.ID +"'>"+ value.TXT_NAME +"</option>";
    });
    $("#search-classSubject").html(string);
    $("#info-modal-classSubject").html(string);
};

var getSubjectName = function(id){
    response = subjects.find(x => x.ID === id).TXT_NAME;
    return response;
};

var searchFilter = function(restartPage){
	var filter = {};
	filter.begin = $("#search-begin").val();
    filter.end = $("#search-end").val();
	filter.classSubject = $("#search-classSubject").children("option:selected").val();
	filter.numClass = $("#search-end").children("option:selected").val();
	filter.includePast = $("#search-includePast").children("option:selected").val();
	if(restartPage == true)
		pagination.page = 1;
	filter.dataPerPage = pagination.dataPerPage;
	filter.page = pagination.page;
	$.blockUI();
	$.post("/Lecture/getFilter", filter, function(response){
		//console.log(response);
		fillTable(response);
		$.unblockUI();
	});
};

var cleanFilter = function(){
    $("#search-begin").val("");
    $("#search-end").val("");
    $("#search-classSubject").val("");
	$("#search-numClass").val("");
	$("#search-includePast").val(0);
	$("#div-numClass").hide();
	searchFilter(true);
};

var getAll = function(){
	$.blockUI();
	$.post("/Lecture/getAll", pagination, function(response){
		//console.log(response)
		fillTable(response);
		$.unblockUI();
	});
};

var openModal = function(id){
	clearModal();
	$("#modalTitle").html("New Lecture");
	actualClass = null;
	actualSubject = null;
	actualDate = null;
	if(id != undefined){
		$("#modalTitle").html("Edit Lecture");
		$.blockUI();
		$.get("/Lecture/get/"+id, function(response){
			if (response.success != true){
				toastr.error(response.data);
				return;
			}
			response = response.data[0];
			console.log(response);
			$("#info-modal-id").val(response.ID);
			$("#info-modal-classSubject").val(response.ID_SUBJECT);
			fillNumClass("#info-modal-classSubject", "#info-modal-numClass", "#info-modal-numClass-toggle", function(){
				$("#info-modal-numClass").val(response.ID_CLASS);
				actualSubject = response.ID_SUBJECT;
				actualClass = response.ID_CLASS;
				date = response.DAT_DAY_OF_LECTURE.slice(0,10);
				actualDate = date;
				$("#info-modal-date").val(date);
				fillInfoDays();
				$.unblockUI();
			});
		});
	}
	$("#mainModal").modal("show");
};

var fillTable = function(response){
	string = "";
    $.each(response.data, function(index, value){
        dateOfLecture = new Date(value.DAT_DAY_OF_LECTURE);
		stringDate = dateOfLecture.toLocaleDateString();
        string += "<tr>";
		string += "<td>" + value.TXT_NAME + "</td>";
		string += "<td>" + value.NUM_CLASS + " / " + value.TXT_SEMESTER + "</td>";
        string += "<td>" + stringDate + "</td>";
        string += "<td>" + value.TXT_DAY + "</td>";
        string += "<td>" + value.DAT_BEGINNING + " - " + value.DAT_END + "</td>";
        string += "<td><img style='cursor:pointer;' onclick = 'openModal(" + value.ID + ")' src='../../icons/pencil.svg' alt='Edit' height='16' width='16'></td>";
		string += "<td><img style='cursor:pointer;' onclick = 'remove(" + value.ID + ")' src='../../icons/trash.svg' alt='Edit' height='16' width='16'></td>";
		string += "<td><a href='../Class/viewClass.html?id=" + value.ID_CLASS + "'><img style='cursor:pointer;' src='../../icons/cog.svg' alt='View' height='16' width='16'></td></a>";
		string += "<td><img style='cursor:pointer;' onclick = 'seeAttendence(" + value.ID + ")' src='../../icons/document.svg' alt='Edit' height='16' width='16'></td>";
        string += "</tr>";
    });
    $("#tbody").html(string);
	$("#numEntries").html("Lectures Found: " + response.numEntries);

	$("#actualPage").html("Page: " + pagination.page);
	totalPages = Math.ceil(response.numEntries/pagination.dataPerPage);
	$("#totalPage").html("/" + totalPages);
	if(totalPages < 2)
		$("#pagination").hide();
	else
		$("#pagination").show();
};

var fillNumClass = function(divIdFrom, divIdTo, divToggle, callback){
	subjectId = $(divIdFrom).children("option:selected").val();
	if(subjectId == ""){
		$(divToggle).hide();
		$(divIdTo).val("");
	}
	else{
		object = {
			idSubject: subjectId,
			numClass: "",
			semester: "",
			page: 1,
			dataPerPage: 999
		};
		$.post("../../../Class/getFilter", object, function(response, status){
			string = "<option value=''>Choose one...</option>";
			$.each(response.data, function(index, value){
				string += "<option value='" + value.ID + "'>" + value.NUM_CLASS + " / " + value.TXT_SEMESTER + "</option>";
			});
			$(divIdTo).html(string);
			if (typeof callback === "function") callback();
		});
		$(divToggle).show();
	}
};

var fillInfoDays = function(){
	classId = $("#info-modal-numClass").children("option:selected").val();
    if(classId == ""){
		$("#info-modal-infoDays").html("");
    }
    else{
		$.blockUI();
		$.get("/Schedule/getByClass/" + classId, function(response){
			string = "<b>Class Schedules:</b><br>";
			$.each(response.data, function(index, value){
				string+= value.TXT_DAY + " (" + value.DAT_BEGINNING + " - " + value.DAT_END + ")<br>";
			});
			$("#info-modal-infoDays").html(string);
			$.unblockUI();
		});
	}
};

var closeModal = function(){
	$("#mainModal").modal("hide");
};

var clearModal = function(){
	$("#info-modal-id").val("")
	$("#info-modal-classSubject").val("");
	$("#info-modal-numClass").val("");
	$("#info-modal-date").val("");
};

var save = function(){
	lecture = {};
	lecture.id = $("#info-modal-id").val();
	lecture.classSubject = $("#info-modal-classSubject").children("option:selected").val();
	lecture.numClass = $("#info-modal-numClass").children("option:selected").val();
	lecture.date = $("#info-modal-date").val();
	dateInfo = $("#info-modal-date").val().split("-");
	date = new Date(dateInfo[0], dateInfo[1]-1, dateInfo[2], 23, 59, 59);
	lecture.day = days[date.getDay()];
	$.blockUI();
	$.post("/Lecture/checkIfExists", lecture, function(data, status){
		alreadyExists = data.length > 0 ? true : false;
		if(alreadyExists == true){
			toastr.error("The Lecture already exists.");
			$.unblockUI();
			return;
		} else{
			$.post("/Lecture/save", lecture, function(data, status){
				if(data.success != true){
					toastr.error(data.data);
					$.unblockUI();
					return;
				}
				toastr.success("Lecture was saved successfuly!");
				$.unblockUI();
				closeModal();
				searchFilter(false);
			});
		};
	});
};

var remove = function(id){
	bootbox.confirm("Do you want to remove this Lecture?", function(response){
		if(response != ""){
			$.blockUI();
			$.post("/Lecture/delete/"+id, id, function(data, status){
				toastr.success("Lecture removed successfuly.");
				$.unblockUI();
				searchFilter(false);
			});
		};
	});
};

var seeAttendence = function(id){
	toastr.info("Under Construction.");
}

var previousPage = function(){
	if(pagination.page != 1){
		pagination.page--;
		searchFilter(false);
	}
};

var nextPage = function(){
	if(pagination.page != totalPages){
		pagination.page++;
		searchFilter(false);
	}
};

var goToPage = function(){
	page = $("#goToInput").val();
	if(page != pagination.page && page <= totalPages && page > 0){
		pagination.page = page;
		searchFilter(false);
	} else if(page > totalPages){
		toastr.error("Page " + totalPages + " is the last page.")
	}
};
