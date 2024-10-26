const Task = require("../models/task");
const BoardMember = require("../models/boardMember");

const addTask = async (req, res,next) => {
  try { 
    const {
      title,
      priority,
      assignedTo,
      queue,
      tasks,
      checkedTasks,
      checkedNumber,
      dueDate,
      user,
    } = req.body;
    if (!title || !priority || !user || !tasks) {
      return res.status(400).json({
        message: "Bad Request",
      });
    }
   const taskDetails = new Task({
      title,
      priority,
      assignedTo,
      queue,
      tasks,
      checkedTasks,
      checkedNumber,
      dueDate,
      user,
    });
   await taskDetails.save();
   res.json({ message: "Task created successfully", isTaskCreated: true });
  } catch (error) {
    next(error);
  }
};


const getTask = async (req, res, next) => {  
    try {
      const { category, timeStamp, createdBy } = req.query;
      const getDateRange = (timeStamp) => {
        const currentTime = new Date();
        switch (timeStamp) {
          case "Today":
            return {
              $lt: currentTime,
              $gt: new Date(currentTime.getTime() - currentTime.getHours() * 60 * 60 * 1000),
            };
          case "This Week":
            return {
              $lt: currentTime,
              $gt: new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000),
            };
          case "This Month":
            return {
              $lt: currentTime,
              $gt: new Date(currentTime.getTime() - 30 * 24 * 60 * 60 * 1000),
            };
          default:
            return {};
        }
      };
  
      const fetchTasks = async (query) => {
        return await Task.find({
          queue: category,
          ...query, 
          createdAt: getDateRange(timeStamp),
        });
      }; 
  
      const taskDetails = await fetchTasks({ user: createdBy });
      const taskDetailsWithAssignee = await fetchTasks({ assignedTo: createdBy }); 
      const taskDetailsWithAssigneeArr = taskDetailsWithAssignee.filter(
        (task) => task.user !== createdBy
        );
       res.json({
        data: [...taskDetails, ...taskDetailsWithAssigneeArr], 
      });
    } catch (error) {
      next(error);
    }
  };
  
  const updateQueueOnTask = async (req, res, next) => {
    try {
      const { id: taskId = "", queue: updatedQueue = "" } = req.query;
      if (!taskId) {
        return res.status(400).json({ message: "Bad Request: Task ID missing" });
      }
      const taskDetails = await Task.findById(taskId);
      if (!taskDetails) {
        return res.status(404).json({ message: "Task not found" });
      }
     taskDetails.queue = updatedQueue;
      await taskDetails.save();
      res.json({ message: "Task updated successfully", updated: true });
    } catch (error) {
      next(error);
    }
  };
  

  const getTaskById = async (req, res, next) => {  
    try {
      const { id: taskId = "" } = req.query;
    if (!taskId) {
        return res.status(400).json({ message: "Task ID is required" });
      }
    const taskDetails = await Task.findById(taskId);
    if (!taskDetails) {
        return res.status(404).json({ message: "Task not found" });
      }
    res.json({ data: taskDetails });
    } catch (error) {
      next(error);
    }
  };
  
  const updateTask = async (req, res, next) => { 
    try {
      const { id: taskId = "" } = req.query;
    if (!taskId) {
        return res.status(400).json({ message: "Task ID is required" });
      }
    const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
    const {
        title,
        priority,
        assignedTo,
        queue,
        tasks,
        dueDate,
        checkedTasks,
        checkedNumber,
        user,
      } = req.body;
  
     
      await Task.findByIdAndUpdate(
        taskId,
        {
          title,
          priority,
          assignedTo,
          queue,
          tasks,
          dueDate,
          checkedTasks,
          checkedNumber,
          user,
        },
        { new: true } 
      );
     res.json({ message: "Task updated successfully" });
    } catch (error) {
      next(error);
    }
  };
  
  const deleteTaskById = async (req, res, next) => {
    try {
      const { id: taskId = "" } = req.query;
    if (!taskId) {
        return res.status(400).json({ message: "Task ID is required" });
      }
    const taskDetails = await Task.findByIdAndDelete(taskId);
   if (!taskDetails) {
        return res.status(404).json({ message: "Task not found" });
      }
  res.json({ message: "Task deleted successfully", isDeleted: true });
    } catch (error) {
      next(error);
    }
  };
  
  const getAnalyticsDetails = async (req, res, next) => {
    try {
      const { user = "" } = req.query;
     if (!user) {
        return res.status(400).json({ message: "User is required" });
      }
  
    const filterAssignedTasks = (tasks, user) =>
        tasks.filter((task) => task.user !== user);
     const fetchTasksByField = async (field, value) => {
        const createdTasks = await Task.find({ [field]: value, user });
        const assignedTasks = filterAssignedTasks(
          await Task.find({ [field]: value, assignedTo: user }),
          user
        );
        return createdTasks.length + assignedTasks.length;
      };
  
  
      const todoTasks = await fetchTasksByField("queue", "Todo");
      const backlogTasks = await fetchTasksByField("queue", "Backlog");
      const progressTasks = await fetchTasksByField("queue", "In Progress");
      const completedTasks = await fetchTasksByField("queue", "Done");
      const lowPriority = await fetchTasksByField("priority", "Low");
      const moderatePriority = await fetchTasksByField("priority", "Moderate");
      const highPriority = await fetchTasksByField("priority", "High");
      const allCreatedTasks = await Task.find({ user });
      const allAssignedTasks = filterAssignedTasks(
        await Task.find({ assignedTo: user }),
        user
      );
      const nullDateTasks = await Task.find({ dueDate: null, user });
      const nullAssignedDateTasks = filterAssignedTasks(
        await Task.find({ dueDate: null, assignedTo: user }),
        user
      );
      const dueDateTasks =
        allCreatedTasks.length +
        allAssignedTasks.length -
        (nullDateTasks.length + nullAssignedDateTasks.length);
  
   return res.json({
        data: {
          todoTasks,
          backlogTasks,
          progressTasks,
          completedTasks,
          lowPriority,
          moderatePriority,
          highPriority,
          dueDateTasks,
        },
      });
    } catch (error) {
      next(error);
    }
  };
  

  const addUser = async (req, res, next) => { 
    try {
      const { email } = req.query;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
    const isUserExists = await BoardMember.findOne({ email });
    if (isUserExists) {
        return res.status(409).json({ message: "User already exists" });
      }
    const userDetails = new BoardMember({ email });
      await userDetails.save();
      return res.status(201).json({ message: "User created successfully", isUserCreated: true });
    } catch (error) {
      next(error);
    }
  };
  


  const getAllBoardMembers = async (req, res, next) => {
    try {
      const boardMemberDetails = await BoardMember.find({});
      return res.json({ data: boardMemberDetails });
    } catch (error) {
      next(error);
    }
  };
  

module.exports = {
  addTask,
  getTask,
  updateQueueOnTask,
  getTaskById,
  updateTask,
  deleteTaskById,
  getAnalyticsDetails,
  addUser,
  getAllBoardMembers,
};
