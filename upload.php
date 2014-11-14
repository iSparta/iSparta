<?php
if ((($_FILES["xfile"]["type"] == "image/png")))
{
  if ($_FILES["xfile"]["error"] > 0)
    {
    echo 0;
    }
  else
{
    $name=time().".png";
    move_uploaded_file($_FILES["xfile"]["tmp_name"],"upload/" . $name);
      echo $name;
    }
}
else
  {
  echo 0;
  }
?>