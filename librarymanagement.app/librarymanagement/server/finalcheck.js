const base = 'http://localhost:5000/api';

async function http(path, init = {}) {
  const res = await fetch(base + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {})
    },
    ...init
  });

  const raw = await res.text();
  let data = null;
  try {
    data = JSON.parse(raw);
  } catch {
    data = raw;
  }

  return { status: res.status, data };
}

(async () => {
  const adminEmail = 'admin_final_' + Date.now() + '@test.com';
  const memberEmail = 'member_final_' + Date.now() + '@test.com';

  const adminReg = await http('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Admin Final', email: adminEmail, password: 'secret123' })
  });

  const memberReg = await http('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Member Final', email: memberEmail, password: 'secret123' })
  });

  if (!adminReg.data || !adminReg.data.token || !memberReg.data || !memberReg.data.token) {
    throw new Error('Registration failed');
  }

  const mongoose = require('mongoose');
  await mongoose.connect('mongodb://127.0.0.1:27017/librarymanagement');
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false, collection: 'users' }));
  await User.updateOne({ email: adminEmail.toLowerCase() }, { $set: { role: 'admin' } });

  const adminToken = adminReg.data.token;
  const memberToken = memberReg.data.token;

  const bookPayload = {
    title: 'Final Verified Book',
    author: 'Demo Author',
    isbn: 'FINAL-' + Date.now(),
    category: 'Technology',
    description: 'Verified by final smoke test',
    totalCopies: 2
  };

  const bookRes = await http('/books', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + adminToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookPayload)
  });

  if (bookRes.status !== 201) {
    throw new Error('Book creation failed: ' + JSON.stringify(bookRes));
  }

  const bookId = bookRes.data.book._id;

  const borrowRes = await http('/borrow', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + memberToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ bookId })
  });

  if (borrowRes.status !== 201) {
    throw new Error('Borrow failed: ' + JSON.stringify(borrowRes));
  }

  const borrowId = borrowRes.data.borrowRecord._id;

  const returnRes = await http('/borrow/' + borrowId + '/return', {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + memberToken }
  });

  if (returnRes.status !== 200) {
    throw new Error('Return failed: ' + JSON.stringify(returnRes));
  }

  const statsRes = await http('/stats', {
    headers: { Authorization: 'Bearer ' + adminToken }
  });

  if (statsRes.status !== 200) {
    throw new Error('Stats failed: ' + JSON.stringify(statsRes));
  }

  console.log(JSON.stringify({
    adminEmail,
    memberEmail,
    bookId,
    borrowId,
    stats: statsRes.data.stats
  }, null, 2));

  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error('END_TO_END_ERROR', err);
  process.exit(1);
});
