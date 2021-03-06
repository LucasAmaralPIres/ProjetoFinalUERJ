var mysql = require('../MySQL/mysqlConnector.js');

var express = require('express'),
    router = express.Router();

//Get pagination Query
var getPaginationString = function(p){
	startingPoint = ((p.page-1) * p.dataPerPage);
	s = "LIMIT "+ startingPoint + ", "+ p.dataPerPage;
	return s;
};

//Count how many entries Classroom have for pagination
var getNumEntries = function(stringWhere, callback){
	mysql.execute("select count(*) as numEntries from T_CLASSROOM " + stringWhere + ";", function(result){
            callback(result[0].numEntries);
    });
};

//Get all
router.get('/getAll', function(req, res){
    mysql.execute("select * from T_CLASSROOM order by TXT_ROOM;", function(result){
		res.json({success:true, data:result});
    });
});

//Get by id
router.get('/get/:id', function(req, res){
	var id = req.params.id;
	mysql.execute("select * from T_CLASSROOM where ID = " + id + ";", function(result){
		if(result.length == 0){
			res.json({success:false, data:"Something is wrong. it seems like this classroom do not exist in the DB. Please talk to the Admin."});
		}
		res.json({success: true, data:result});
	});
});

//Get Classes by id
router.get('/getClasses/:id', function(req, res){
    var id = req.params.id;
    mysql.execute("select c.ID, s.TXT_NAME, c.NUM_CLASS, c.TXT_SEMESTER from T_CLASSROOM_CLASS cc, T_CLASS c, T_SUBJECT s where cc.ID_CLASS = c.ID and c.ID_SUBJECT = s.ID and cc.ID_CLASSROOM = " + id + ";", function(result){
        if(result.length == 0)
            res.json({success:false, data:"This Classroom is not enrolled to any Class for now."});
        else
			res.json({success: true, data:result});
    });
});

//Get by Filter
router.post('/getFilter', function(req, res){
	var filter = req.body;
	filter.pagination = {page:filter.page, dataPerPage:filter.dataPerPage}
	string = "select * from T_CLASSROOM ";
	stringWhere = " where 1=1 ";
	stringPag = getPaginationString(filter.pagination);
	if(filter.room != null && filter.room != ""){
		stringWhere += "and TXT_ROOM LIKE '%"+ filter.room +"%'";
	}
	if(filter.restrict != null && filter.restrict != ""){
        stringWhere += "and FL_RESTRICT LIKE '%"+ filter.restrict +"%'";
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
		mysql.execute("delete from T_CLASSROOM where ID = " + id + ";", function(result){
			res.json(result);
		});
	});
});

//Delete from every Class when deleted
var deleteFromClasses = function(id, callback){
    mysql.execute("delete from T_CLASSROOM_CLASS where ID_CLASSROOM=" + id + ";", function(result){
        callback();
    });
};

//Check if already exists
router.post('/checkIfExists', function(req, res){
	classroom = req.body;
	mysql.execute("select * from T_CLASSROOM where TXT_ROOM = '" + classroom.room + "'", function(result){
		res.json(result);
	});
});

//Save to Database
router.post('/save', function(req, res){
	data = req.body;

	//Error Handling
	if (data.room == null || data.room == ""){
		res.json({success: false, data:"Room is missing."});
		return;
	}


	if(data.id == undefined || data.id == "" || data.id == null){
		console.log("insert into T_CLASSROOM values(0, '" + data.room + "', "+ data.restrict +");");
		mysql.execute("insert into T_CLASSROOM values(0, '" + data.room + "', "+ data.restrict +");", function(result){
			res.json({success: true, data:result});
		});
	}
	else {
		mysql.execute("update T_CLASSROOM set TXT_ROOM='" + data.room + "', FL_RESTRICT='"+ data.restrict + "' where ID = "+ data.id + ";", function(result){
			res.json({success: true, data:result});
		});
	}
});

module.exports = router;
