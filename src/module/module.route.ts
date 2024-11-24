import { Router } from 'express';
import Controller from './module.controller'
import * as validation from './module.validation'

const router = Router();
const controller = new Controller();

router.get('/allocation', validation.getAllocation, controller.getAllocation);
router.post('/allocation', validation.postAllocation, controller.postAllocation);


export default router