echo "Quarks.install(\"$TRAVIS_BUILD_DIR/quarks/supercollider-redux-sequencers\");" >> $TRAVIS_BUILD_DIR/install_quark.sc
echo "Quarks.install(\"/home/travis/.local/share/SuperCollider/downloaded-quarks/supercollider-redux/quarks/supercollider-redux\");" >> $TRAVIS_BUILD_DIR/install_quark.sc
echo "thisProcess.shutdown();" >> $TRAVIS_BUILD_DIR/install_quark.sc
echo "0.exit();" >> $TRAVIS_BUILD_DIR/install_quark.sc
sclang $TRAVIS_BUILD_DIR/install_quark.sc
exit 0
