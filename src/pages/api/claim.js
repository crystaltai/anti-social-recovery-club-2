
import nc from 'next-connect';
import { claimOwnership } from '../../api-lib/contract-helper';

const handler = nc({
  onError: (err, req, res, next) => {
    console.log("error in claimOwnership route");
    console.log(err);
    res.status(500).send(err);
  },
  onNoMatch: (req, res) => {
    res.status(404).json({ error: { message: 'route not found' } });
    return;
  },
  attachParams: true,
})
  .post(async (req, res) => {
    var returnObject = new Object();
    //root, nullifierHash, proof
    const root = req.body.merkle_root;
    const nullifierHash = req.body.nullifier_hash;
    const proof = req.body.proof;
    contractAddress = await deploy(root, nullifierHash, proof);
    returnObject.contractAddress = contractAddress;
    returnObject.status = 200;
    res.json(returnObject);
  });

export default handler;
