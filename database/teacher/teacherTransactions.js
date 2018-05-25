/**
 * Created by Yash 1300 on 16-04-2018.
 */

const Teacher = require('./teacherModel');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');

module.exports.findTeacherByUsernameOrEmail = (input, next) => {
    Teacher.findOne({$or:[{username: input}, {email: input}]}).exec(next);
};

module.exports.findTeacherById = (id, next) => {
    Teacher.findOne({_id: id}, {_id: 0, password: 0}).populate([{path: 'students', model: 'Favorite'}, {path: 'skills', model: 'Skill'}]).exec(next);
};

module.exports.addTeacher = (name, username, email, password, contact, next) => {
    let newTeacher = new Teacher({
        name: name,
        username: username,
        email: email,
        password: password,
        contact: contact
    });

    bcrypt.genSalt(10, (err, salt) => {
        if (err)
            return next(err);
        bcrypt.hash(newTeacher.password, salt, null, (err, hash) => {
            if (err)
                return next(err);
            newTeacher.password = hash;
            newTeacher.save(next);
        });
    });
};

module.exports.verifyPassword = (teacher, passwordInput, next) => {
    bcrypt.compare(passwordInput, teacher.password, (err, correctPassword) => err ? next(err, null) : next(null, correctPassword));
};

module.exports.generateToken = (teacher, secret) => {
    return jwt.sign(JSON.parse(JSON.stringify(teacher)), secret);
};

module.exports.appendStudent = (favoriteId, teacherId, next) => {
    Teacher.findOneAndUpdate({_id: teacherId}, {$addToSet: {students: favoriteId}}).exec(next);
};

module.exports.addSkills = (teacherId, skills, next) => {
    Teacher.findOneAndUpdate({_id: teacherId}, {$addToSet: {skills: {$each: skills}}}).exec(next);
};