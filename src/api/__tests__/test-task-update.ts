// Test script for task updates
async function testTaskUpdate() {
  const testTask = {
    id: 'task-003-1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'in-progress',
    priority: 'high',
    type: 'feature',
    labels: ['test'],
    dependencies: ['task-001'],
    content: {
      description: 'Test Description',
      acceptance_criteria: [],
      implementation_details: '',
      notes: '',
      attachments: [],
      due_date: '2025-02-01',
      assignee: 'Test User'
    }
  };

  try {
    // Update task
    console.log('Updating task...');
    const response = await fetch(`http://localhost:8000/api/tasks/${testTask.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testTask)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Update failed:', error);
      return;
    }

    const updatedTask = await response.json();
    console.log('Update response:', updatedTask);

    // Fetch task to verify persistence
    console.log('\nFetching task...');
    const getResponse = await fetch(`http://localhost:8000/api/tasks/${testTask.id}`);
    
    if (!getResponse.ok) {
      const error = await getResponse.json();
      console.error('Fetch failed:', error);
      return;
    }

    const fetchedTask = await getResponse.json();
    console.log('Fetched task:', fetchedTask);

    // Verify fields
    console.log('\nVerifying fields...');
    console.log('Due Date:', {
      expected: testTask.content.due_date,
      actual: fetchedTask.content.due_date,
      matches: testTask.content.due_date === fetchedTask.content.due_date
    });
    console.log('Assignee:', {
      expected: testTask.content.assignee,
      actual: fetchedTask.content.assignee,
      matches: testTask.content.assignee === fetchedTask.content.assignee
    });
    console.log('Type:', {
      expected: testTask.type,
      actual: fetchedTask.type,
      matches: testTask.type === fetchedTask.type
    });
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testTaskUpdate(); 