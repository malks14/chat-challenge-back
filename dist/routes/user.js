"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
/*
    USERS ROUTES
*/
router.get('/user', user_controller_1.getUsers);
router.get('/user/:userId', user_controller_1.getUser);
router.delete('/user/:userId', auth_controller_1.isAuth, user_controller_1.deleteUser);
router.post('/user/create', user_controller_1.createUser);
router.post('/user/login', user_controller_1.logInUser);
exports.default = router;
