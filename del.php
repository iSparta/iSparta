<?php
if (isset($_POST["name"]))
{
  unlink("upload/".$_POST["name"]);
}
?>