<?php
  header('Access-Control-Allow-Origin: *');
  header("Content-type: application/json");

  $response = array();
  $response['status'] = false;
  if (isset($_FILES) && isset($_FILES['image']) && verifyFile()) {
    $dest = 'graphics/' . $_FILES["image"]["name"];
    if (move_uploaded_file($_FILES["image"]["tmp_name"], $dest)) {
      $response['status'] = true;
      $response['name'] = $_FILES["image"]["name"];
    }
  }

  function verifyFile() {
    return preg_match("`^[-0-9A-Z_\.]+$`i", $_FILES['image']['name'])
      && preg_match('/gif|png|x-png|jpeg|jpg/', $_FILES['image']['type'])
      && $_FILES['image']['size'] && $_FILES['image']['size'] < 2048000;
  }

  echo json_encode($response);
?>
