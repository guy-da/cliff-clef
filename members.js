/*
function sayHello() {
  return 'Bonjour';
}
*/
class Member {

  constructor(id, nom, prenom) {
    this.memberid = id;
    this.surname = nom;    
    this.forename = prenom;
  }

}

exports.getMembersList = function () {
  let coll = [ 
          new Member("1951", "Dalberto", "Guy"), 
          new Member("1982", "Dalberto", "Damien"), 
        ];
  return coll;
}

exports.prepareMembersTable = function (members) {
    let htmlRows = '';
    members.forEach(function(row, nr, members) {      
      htmlRows += '<tr><td>' + row.surname + '</td><td>' + row.memberid + '</td></tr>';     
    });

    let commentsPage = '<table>'
      + '<tr> <th> Nom </th> <th> memberid </th> </tr>'
      + htmlRows
      + '</table>'
      
  return commentsPage;
}



