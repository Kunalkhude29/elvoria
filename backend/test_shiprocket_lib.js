const { getToken } = require('./lib/shiprocket');

async function test() {
  try {
    const token = await getToken();
    console.log('Got token:', token);
  } catch (error) {
    console.error('Error:', error);
  }
}
test();
