var mysql = require('../MySQL/mysqlConnector.js');

var express = require('express'),
    router = express.Router();

//Get pagination Query
var getPaginationString = function(p){
	startingPoint = ((p.page-1) * p.dataPerPage);
	s = "LIMIT "+ startingPoint + ", "+ p.dataPerPage;
	return s;
};

//Count how many entries Schedule have for pagination
var getNumEntries = function(stringWhere, callback){
	mysql.execute("select count(*) as numEntries from T_SCHEDULE " + stringWhere + ";", function(result){
            callback(result[0].numEntries);
    });
};

//Get all
router.get('/getAll', function(req, res){
    mysql.execute("select * from T_SCHEDULE order by TXT_DAY, DAT_BEGINNING;", function(result){
		res.json({success:true, data:result});
    });
});

//Get by id
router.get('/get/:id', function(req, res){
	var id = req.params.id;
	mysql.execute("select * from T_SCHEDULE where ID = " + id + ";", function(result){
		if(result.length == 0){
			res.json({success:false, data:"Something is wrong. it seems like this schedule do not exist in the DB. Please talk to the Admin."});
		}
		res.json({success: true, data:result});
	});
});

//Get all by Class id
router.get('/getByClass/:id', function(req, res){
	var id = req.params.id;
	mysql.execute("select s.* from T_SCHEDULE_CLASS sc, T_SCHEDULE s, T_CLASS c where sc.ID_SCHEDULE = s.ID and sc.ID_CLASS = c.ID and c.ID = " + id + ";", function(result){
		res.json({success: true, data:result})
	});
});

//Get by Filter
router.post('/getFilter', function(req, res){
	var filter = req.body;
	filter.pagination = {page:filter.page, dataPerPage:filter.dataPerPage}
	string = "select * from T_SCHEDULE ";
	stringWhere = " where 1=1 ";
	stringPag = getPaginationString(filter.pagination);

	if(filter.beginFrom != null && filter.beginFrom != ""){
		stringWhere += "and TIME(DAT_BEGINNING) >= TIME('"+ filter.beginFrom +"') ";
	}
	if(filter.beginTo != null && filter.beginTo != ""){
        stringWhere += "and TIME(DAT_BEGINNING) <= TIME('"+ filter.beginTo +"') ";
    }

	if(filter.endFrom != null && filter.endFrom != ""){
        stringWhere += "and TIME(DAT_END) >= TIME('"+ filter.endFrom +"') ";
    }
    if(filter.endTo != null && filter.endTo != ""){
        stringWhere += "and TIME(DAT_END) <= TIME('"+ filter.endTo +"') ";
    }

	if(filter.day != null && filter.day != ""){
        stringWhere += "and TXT_DAY LIKE '%"+ filter.day +"%' ";
    }
	if(filter.description != null && filter.description != ""){
        stringWhere += "and TXT_DESCRIPTION LIKE '%"+ filter.description +"%'";
    }

	mysql.execute(string+stringWhere+stringPag+";", function(result){
		entries = getNumEntries(stringWhere, function(numEntries){
            res.json({success:true, data:result, numEntries:numEntries});
        });
    });
});

//Delete (Logical) by id
router.post("/delete/:id", function(req, res){
    var id = req.params.id;
    deleteFromClasses(id, function(){
        mysql.execute("delete from T_SCHEDULE where ID = " + id + ";", function(result){
            res.json(result);
        });
    });
});

//Delete from every Class when deleted
var deleteFromClasses = function(id, callback){
    mysql.execute("delete from T_SCHEDULE_CLASS where ID_SCHEDULE=" + id + ";", function(result){
        callback();
    });
};


//Check if already exists
router.post('/checkIfExists', function(req, res){
	schedule = req.body;
	mysql.execute("select * from T_SCHEDULE where DAT_BEGINNING = '" + schedule.begin + "' and DAT_END = '"+ schedule.end + "' and TXT_DAY = '" + schedule.day + "';", function(result){
		res.json(result);
	});
});

//Save to Database
router.post('/save', function(req, res){
	data = req.body;

	//Error Handling
	if (data.begin == null || data.begin == ""){
		res.json({success: false, data:"Begin date is missing."});
		return;
	}
	if (data.end == null || data.end == ""){
        res.json({success: false, data:"End date is missing."});
        return;
    }
	if (data.day == null || data.day == ""){
		res.json({success: false, data:"Day is missing."});
		return;
	}

	if(data.id == undefined || data.id == "" || data.id == null){
		mysql.execute("insert into T_SCHEDULE values(0, '" + data.begin + "', '"+ data.end + "', '" + data.day + "', '" + data.description + "');", function(result){
			res.json({success: true, data:result});
		});
	}
	else {
		mysql.execute("update T_SCHEDULE set DAT_BEGINNING='" + data.begin + "', DAT_END='"+ data.end + "', TXT_DAY='" + data.day + "', TXT_DESCRIPTION='" + data.description + "' where ID = "+ data.id + ";", function(result){
			res.json({success: true, data:result});
		});
	}
});

module.exports = router;
