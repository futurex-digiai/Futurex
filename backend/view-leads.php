<?php
// view-leads.php
// A simple password-protected page for your client to view submissions.
// Upload to public_html. Visit yourdomain.com/view-leads.php, enter the
// password set in db-config.php, and see all entries in a table --
// no code, no separate site, no login system needed.

require __DIR__ . '/db-config.php';
session_start();

$error = '';

// Handle password submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    if ($_POST['password'] === VIEW_PASSWORD) {
        $_SESSION['leads_authed'] = true;
    } else {
        $error = 'Incorrect password.';
    }
}

$authed = !empty($_SESSION['leads_authed']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Form Submissions</title>
<style>
  body{
    margin:0; padding:32px; background:#0f0f14; color:#e9e9f0;
    font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
  }
  h1{font-size:22px; margin:0 0 20px}
  .box{
    max-width:360px; margin:80px auto; background:#17171f;
    border:1px solid #2a2a35; border-radius:12px; padding:28px;
  }
  input[type=password]{
    width:100%; padding:10px 12px; margin:12px 0; border-radius:8px;
    border:1px solid #2a2a35; background:#0f0f14; color:#e9e9f0;
    font-size:14px; box-sizing:border-box;
  }
  button{
    width:100%; padding:10px; border:none; border-radius:8px;
    background:#7c6bf2; color:white; font-weight:600; font-size:14px;
    cursor:pointer;
  }
  .error{color:#ff8080; font-size:13px; margin-top:8px}
  table{
    width:100%; border-collapse:collapse; background:#17171f;
    border:1px solid #2a2a35; border-radius:10px; overflow:hidden;
  }
  th,td{
    text-align:left; padding:10px 14px; font-size:13px;
    border-bottom:1px solid #2a2a35; vertical-align:top;
  }
  th{color:#9797a8; background:#1c1c26}
  tr:last-child td{border-bottom:none}
  .msg{max-width:340px; white-space:pre-wrap; color:#cfcfe0}
  .top{display:flex; justify-content:space-between; align-items:center; margin-bottom:16px}
  .logout{color:#9797a8; font-size:13px; text-decoration:none}
</style>
</head>
<body>

<?php if (!$authed): ?>
  <div class="box">
    <h1>Enter password</h1>
    <form method="POST">
      <input type="password" name="password" placeholder="Password" autofocus>
      <button type="submit">View submissions</button>
    </form>
    <?php if ($error): ?><div class="error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
  </div>

<?php else: ?>
  <div class="top">
    <h1>Form Submissions</h1>
    <a class="logout" href="?logout=1">Log out</a>
  </div>
  <?php
  if (isset($_GET['logout'])) {
      session_destroy();
      echo '<script>window.location = "view-leads.php";</script>';
      exit;
  }

  try {
      $pdo = new PDO(
          "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
          DB_USER,
          DB_PASS,
          [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
      );
      $stmt = $pdo->query("SELECT * FROM leads ORDER BY created_at DESC LIMIT 5000");
      $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);
  } catch (PDOException $e) {
      echo '<p>Could not load submissions. Check the database settings.</p>';
      $leads = [];
  }
  ?>
  <table>
    <thead>
      <tr>
        <th>Date</th><th>Name</th><th>Email</th><th>Interested in</th><th>Message</th>
      </tr>
    </thead>
    <tbody>
      <?php if (empty($leads)): ?>
        <tr><td colspan="5">No submissions yet.</td></tr>
      <?php else: foreach ($leads as $lead): ?>
        <tr>
          <td><?= htmlspecialchars($lead['created_at']) ?></td>
          <td><?= htmlspecialchars($lead['name']) ?></td>
          <td><?= htmlspecialchars($lead['email']) ?></td>
          <td><?= htmlspecialchars($lead['interested_in'] ?? '—') ?></td>
          <td class="msg"><?= htmlspecialchars($lead['message']) ?></td>
        </tr>
      <?php endforeach; endif; ?>
    </tbody>
  </table>
<?php endif; ?>

</body>
</html>
