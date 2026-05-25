async function test() {
    try {
        const res1 = await fetch("http://localhost:5001/api/auth/admin/login", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({email: "admin@elvoria.com", password: "adminpassword" })
        });
        const text = await res1.text();
        console.log("Login Res:", text);
    } catch(err) {
        console.error(err);
    }
}
test();
