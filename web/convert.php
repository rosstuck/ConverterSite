<?php
require __DIR__.'/../vendor/autoload.php';

try {
    $converter = new \Tuck\ConverterBundle\ConfigFormatConverter(
        new \Tuck\ConverterBundle\Loader\StandardLoaderFactory(),
        new \Tuck\ConverterBundle\Dumper\StandardDumperFactory(),
        new \Tuck\ConverterBundle\File\SysTempFileFactory()
    );

    // Can not allow php as an input format since it's basically a big eval
    \Assert\that($_POST['old_format'])
        ->notEmpty()
        ->inArray(array('xml', 'yml', 'ini'));

    // PHP is allowed here since it's generated via string concat
    \Assert\that($_POST['new_format'])
        ->notEmpty()
        ->inArray(array('xml', 'ini', 'php', 'yml', 'gv'));

    \Assert\that($_POST['content'])
        ->notEmpty()
        ->string();

    echo $converter->convertString($_POST['content'], $_POST['old_format'], $_POST['new_format']);
} catch(\Assert\InvalidArgumentException $e) {
    http_response_code(400);
} catch(\Exception $e) {
    http_response_code(500);
}